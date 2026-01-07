import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'FeedBack',
        href: dashboard().url,
    },

];

export default function FeedBack() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Feedback Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Click a star rating to view its feedback
                        </p>
                    </div>

                    {/* 5 Star Feedback Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">

                        {/* Clickable Header (UI only) */}
                        <button
                            type="button"
                            className="w-full px-6 py-4 border-b border-gray-200 dark:border-gray-700
                                flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    5 Star Feedback
                                </h2>

                                {/* Stars */}
                                <div className="flex gap-1">
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                </div>

                                {/* Count Badge */}
                                <span className="ml-2 text-xs px-2 py-1 rounded-full
                                    bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                                    3
                                </span>
                            </div>

                            {/* Arrow */}
                            <svg
                                className="w-5 h-5 text-gray-500 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Feedback List (Visible placeholder) */}
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">

                            {/* Feedback Item */}
                            <div className="px-6 py-4">

                                {/* Stars */}
                                <div className="flex items-center gap-1 mb-2">
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-yellow-400">★</span>
                                </div>

                                {/* Comment */}
                                <p className="text-gray-800 dark:text-gray-200 mb-2">
                                    Very smooth process and helpful staff.
                                </p>

                                {/* Meta */}
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2">
                                    <span>Jan 02, 2026 10:45 AM</span>
                                    <span>•</span>
                                    <span className="capitalize">approved</span>
                                </div>
                            </div>

                            {/* Empty Feedback Placeholder */}
                            <div className="px-6 py-6 text-center text-gray-400 text-sm">
                                No feedback for this rating
                            </div>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No feedback yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Feedback submitted by school registrars will appear here.
                        </p>
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
