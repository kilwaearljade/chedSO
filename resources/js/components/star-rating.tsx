import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    value?: number;
    onChange?: (rating: number) => void;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function StarRating({
    value = 0,
    onChange,
    disabled = false,
    size = "md",
    className,
}: StarRatingProps) {
    const [hoveredRating, setHoveredRating] = useState<number>(0);

    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    const handleClick = (rating: number) => {
        if (!disabled && onChange) {
            onChange(rating);
        }
    };

    const handleMouseEnter = (rating: number) => {
        if (!disabled) {
            setHoveredRating(rating);
        }
    };

    const handleMouseLeave = () => {
        if (!disabled) {
            setHoveredRating(0);
        }
    };

    const displayRating = hoveredRating || value;

    return (
        <div
            className={cn("flex items-center gap-1", className)}
            onMouseLeave={handleMouseLeave}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= displayRating;
                const isInteractive = !disabled && onChange;

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        disabled={disabled || !isInteractive}
                        className={cn(
                            "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm",
                            sizeClasses[size],
                            isInteractive && "cursor-pointer hover:scale-110",
                            disabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                "transition-colors duration-200",
                                isFilled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600",
                                isInteractive &&
                                    hoveredRating >= star &&
                                    !isFilled &&
                                    "fill-yellow-200 text-yellow-200"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}

