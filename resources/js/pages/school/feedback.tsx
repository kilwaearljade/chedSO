import { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import StarRating from "@/components/star-rating";
import InputError from "@/components/input-error";
import { MessageSquare, Send } from "lucide-react";
import { schooldashboard } from "@/routes";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Feedback",
        href: schooldashboard().url,
    },
];

interface FeedbackPageProps {
    status?: string;
}

export default function Feedback({ status }: FeedbackPageProps) {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [processing, setProcessing] = useState<boolean>(false);
    const [errors, setErrors] = useState<{
        rating?: string;
        comment?: string;
    }>({});
    const [submitted, setSubmitted] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setErrors({});

        // Validation
        const newErrors: { rating?: string; comment?: string } = {};
        
        if (rating === 0) {
            newErrors.rating = "Please select a rating";
        }

        if (!comment.trim()) {
            newErrors.comment = "Please provide your feedback";
        } else if (comment.trim().length < 10) {
            newErrors.comment = "Feedback must be at least 10 characters long";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);

        // TODO: Replace with actual form submission using Inertia.js
        // Example: router.post('/feedback', { rating, comment })
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // On success
            setSubmitted(true);
            setRating(0);
            setComment("");
            
            // Reset submitted state after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 3000);
        } catch (error) {
            setErrors({ comment: "Failed to submit feedback. Please try again." });
        } finally {
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setRating(0);
        setComment("");
        setErrors({});
        setSubmitted(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feedback" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Share Your Feedback
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        We value your opinion. Please share your experience with CHED XII Special-Order services.
                    </p>
                </div>

                {/* Feedback Form */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <CardTitle>Submit Feedback</CardTitle>
                            </div>
                            <CardDescription>
                                Rate your experience and provide detailed feedback to help us improve.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {status && (
                                <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                        {status}
                                    </p>
                                </div>
                            )}

                            {submitted && (
                                <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                        Thank you! Your feedback has been submitted successfully.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Rating Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="rating" className="text-base">
                                        How would you rate your experience? <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex flex-col gap-2">
                                        <StarRating
                                            value={rating}
                                            onChange={setRating}
                                            disabled={processing || submitted}
                                            size="lg"
                                            className="justify-center sm:justify-start"
                                        />
                                        <p className="text-xs text-muted-foreground text-center sm:text-left">
                                            {rating === 0 && "Click on a star to rate"}
                                            {rating === 1 && "Poor"}
                                            {rating === 2 && "Fair"}
                                            {rating === 3 && "Good"}
                                            {rating === 4 && "Very Good"}
                                            {rating === 5 && "Excellent"}
                                        </p>
                                    </div>
                                    <InputError message={errors.rating} />
                                </div>

                                {/* Comment Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="comment">
                                        Your Feedback <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="comment"
                                        name="comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Please share your detailed feedback about your experience..."
                                        rows={8}
                                        disabled={processing || submitted}
                                        className="min-h-[200px] resize-y"
                                    />
                                    <div className="flex items-center justify-between">
                                        <InputError message={errors.comment} />
                                        <span className="text-xs text-muted-foreground">
                                            {comment.length} characters
                                        </span>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    {(rating > 0 || comment.trim()) && !submitted && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleReset}
                                            disabled={processing}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={processing || submitted || rating === 0 || !comment.trim()}
                                        className="min-w-[120px]"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                Submitting...
                                            </>
                                        ) : submitted ? (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Submitted
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Submit Feedback
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Information Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Feedback Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <p>Be specific and detailed in your feedback</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <p>Share both positive aspects and areas for improvement</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <p>Your feedback helps us serve you better</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <p>All feedback is reviewed by administrators</p>
                                </div>
                            </div>

                            <div className="rounded-md border bg-muted/50 p-4">
                                <p className="text-xs text-muted-foreground">
                                    <strong className="text-foreground">Note:</strong> Your feedback
                                    will be visible to administrators and may be used to improve our
                                    services.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

