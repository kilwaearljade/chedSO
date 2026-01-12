import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'FeedBack',
        href: dashboard().url,
    },
];

interface Feedback {
    id: number;
    rating: number;
    comment: string;
    status: string;
    created_at: string;
    created_date: string;
    created_time: string;
}

interface FeedbackPageProps {
    feedbacks: {
        [rating: number]: Feedback[];
    };
    totalFeedbacks: number;
}

export default function FeedBack({ feedbacks = {}, totalFeedbacks = 0 }: FeedbackPageProps) {
    const [expandedRatings, setExpandedRatings] = useState<Set<number>>(new Set());

    const toggleRating = (rating: number) => {
        setExpandedRatings((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(rating)) {
                newSet.delete(rating);
            } else {
                newSet.add(rating);
            }
            return newSet;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'approved':
                return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Feedback Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage feedback from school registrars ({totalFeedbacks} total)
                        </p>
                    </div>

                    {/* Feedback Sections by Rating */}
                    {totalFeedbacks === 0 ? (
                        /* Empty State */
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No feedback yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Feedback submitted by school registrars will appear here.
                            </p>
                        </div>
                    ) : (
                        /* Rating Sections (5 to 1 stars) */
                        Array.from({ length: 5 }, (_, i) => 5 - i).map((rating) => {
                            const ratingFeedbacks = feedbacks[rating] || [];
                            const isExpanded = expandedRatings.has(rating);

                            if (ratingFeedbacks.length === 0) {
                                return null;
                            }

                            return (
                                <div
                                    key={rating}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                                >
                                    {/* Clickable Header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleRating(rating)}
                                        className="w-full px-6 py-4 border-b border-gray-200 dark:border-gray-700
                                            flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {rating} Star{rating !== 1 ? 's' : ''} Feedback
                                            </h2>

                                            {/* Stars */}
                                            <div className="flex gap-1">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <span
                                                        key={i}
                                                        className={
                                                            i < rating
                                                                ? 'text-yellow-400'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Count Badge */}
                                            <span className="ml-2 text-xs px-2 py-1 rounded-full
                                                bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                                                {ratingFeedbacks.length}
                                            </span>
                                        </div>

                                        {/* Arrow */}
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>

                                    {/* Feedback List */}
                                    {isExpanded && (
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {ratingFeedbacks.map((feedback) => (
                                                <div key={feedback.id} className="px-6 py-4">
                                                    {/* Stars */}
                                                    <div className="flex items-center gap-1 mb-2">
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <span
                                                                key={i}
                                                                className={
                                                                    i < feedback.rating
                                                                        ? 'text-yellow-400'
                                                                        : 'text-gray-300 dark:text-gray-600'
                                                                }
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Comment */}
                                                    <p className="text-gray-800 dark:text-gray-200 mb-2">
                                                        {feedback.comment}
                                                    </p>

                                                    {/* Meta */}
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                                                        <span>
                                                            {feedback.created_date} {feedback.created_time}
                                                        </span>
                                                        <span>•</span>
                                                        <span
                                                            className={`capitalize px-2 py-0.5 rounded ${getStatusColor(
                                                                feedback.status
                                                            )}`}
                                                        >
                                                            {feedback.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                </div>

            </div>
        </AppLayout>
    );
}
