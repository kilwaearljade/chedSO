import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentPaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    onPrevious: () => void;
    onNext: () => void;
}

export default function AppointmentPagination({
    currentPage,
    lastPage,
    total,
    onPrevious,
    onNext,
}: AppointmentPaginationProps) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                    Showing page {currentPage} of {lastPage} ({total} total)
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNext}
                        disabled={currentPage === lastPage}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
