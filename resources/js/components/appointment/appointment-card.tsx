import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Building2, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { statusConfig, type Appointment } from './types';

interface AppointmentCardProps {
    appointment: Appointment;
    onStatusUpdate: (appointmentId: number, newStatus: 'pending' | 'complete' | 'cancelled') => void;
    onDelete: (appointmentId: number) => void;
    onViewDetails: (appointment: Appointment) => void;
}

export default function AppointmentCard({
    appointment,
    onStatusUpdate,
    onDelete,
    onViewDetails,
}: AppointmentCardProps) {
    const status = statusConfig[appointment.status];

    return (
        <Card className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-shrink-0">
                            {appointment.user?.profile_photo_path ? (
                                <img
                                    src={`/storage/${appointment.user.profile_photo_path}`}
                                    alt={appointment.user.name}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg line-clamp-1">
                                {appointment.user?.name || appointment.school_name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {appointment.reason}
                            </CardDescription>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                            >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onStatusUpdate(appointment.id, 'pending')}
                                disabled={appointment.status === 'pending'}
                            >
                                Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onStatusUpdate(appointment.id, 'complete')}
                                disabled={appointment.status === 'complete'}
                            >
                                Mark as Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                                disabled={appointment.status === 'cancelled'}
                            >
                                Mark as Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(appointment.id)}
                                className="text-red-600"
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                {/* Appointment Date */}
                <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                        <p className="font-medium text-foreground">
                            {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Appointment Date
                        </p>
                    </div>
                </div>

                {/* File Count */}
                <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                        <p className="font-medium text-foreground">
                            {/* Show daily_file_count for split appointments, otherwise show file_count */}
                            {appointment.daily_file_count !== null && appointment.daily_file_count !== undefined
                                ? `${appointment.daily_file_count} ${appointment.daily_file_count === 1 ? 'file' : 'files'}`
                                : `${appointment.file_count} ${appointment.file_count === 1 ? 'file' : 'files'}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {appointment.is_split && appointment.daily_file_count
                                ? `Files for this day (${appointment.split_sequence}/${appointment.total_splits})`
                                : 'Total files'}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2">
                    <Badge
                        variant={status.variant}
                        className={status.className}
                    >
                        {status.label}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onViewDetails(appointment)}
                >
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
}
