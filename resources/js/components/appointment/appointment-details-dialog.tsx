import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { statusConfig, type Appointment } from './types';

interface AppointmentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
    onStatusUpdate: (appointmentId: number, newStatus: 'pending' | 'complete' | 'cancelled') => void;
}

export default function AppointmentDetailsDialog({
    open,
    onOpenChange,
    appointment,
    onStatusUpdate,
}: AppointmentDetailsDialogProps) {
    const handleClose = () => {
        onOpenChange(false);
    };

    const handleComplete = () => {
        if (appointment) {
            onStatusUpdate(appointment.id, 'complete');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Appointment Details</DialogTitle>
                    <DialogDescription>
                        {appointment?.user?.name ||
                            appointment?.school_name ||
                            'Appointment'}
                    </DialogDescription>
                </DialogHeader>

                {appointment ? (
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">School</div>
                                <div className="font-medium">
                                    {appointment.school_name}
                                </div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Status</div>
                                <div className="pt-1">
                                    <Badge
                                        variant={statusConfig[appointment.status].variant}
                                        className={statusConfig[appointment.status].className}
                                    >
                                        {statusConfig[appointment.status].label}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Appointment Date</div>
                                <div className="font-medium">
                                    {new Date(
                                        appointment.appointment_date,
                                    ).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Files</div>
                                <div className="font-medium">
                                    {/* Show daily_file_count for split appointments, otherwise show file_count */}
                                    {appointment.daily_file_count !== null && appointment.daily_file_count !== undefined
                                        ? `${appointment.daily_file_count} ${appointment.daily_file_count === 1 ? 'file' : 'files'}`
                                        : `${appointment.file_count} ${appointment.file_count === 1 ? 'file' : 'files'}`}
                                </div>
                                {appointment.is_split && appointment.daily_file_count && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Split {appointment.split_sequence}/{appointment.total_splits} of {appointment.file_count} total files
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border p-3">
                            <div className="text-xs text-muted-foreground">Reason</div>
                            <div className="mt-1 text-sm">
                                {appointment.reason || '—'}
                            </div>
                        </div>

                        {appointment.user?.name || appointment.user?.profile_photo_path ? (
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">Requested By</div>
                                <div className="mt-2 flex items-center gap-3">
                                    {appointment.user?.profile_photo_path ? (
                                        <img
                                            src={`/storage/${appointment.user.profile_photo_path}`}
                                            alt={appointment.user.name}
                                            className="h-10 w-10 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                    <div className="font-medium">
                                        {appointment.user?.name}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <DialogFooter>
                    {appointment ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleComplete}
                            >
                                Mark as Complete
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={handleClose}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
