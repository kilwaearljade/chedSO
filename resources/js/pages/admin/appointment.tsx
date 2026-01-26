import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as appointmentIndex, status as appointmentStatus, destroy as appointmentDestroy } from '@/routes/appointment';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, FileText, Building2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointment',
        href: dashboard().url,
    },
];

const statusConfig = {
    pending: {
        label: 'Pending',
        variant: 'outline' as const,
        className: 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
    },
    complete: {
        label: 'Complete',
        variant: 'outline' as const,
        className: 'border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'outline' as const,
        className: 'border-red-500/50 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    },
};

interface User {
    id: number;
    name: string;
    profile_photo_path?: string;
}

interface Appointment {
    id: number;
    school_name: string;
    appointment_date: string;
    file_count: number;
    status: 'pending' | 'complete' | 'cancelled';
    reason?: string;
    user?: User;
}

interface AppointmentProps {
    appointments: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        search: string;
        status: string;
        date: string;
    };
}

export default function Appointment({ appointments, filters }: AppointmentProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState<string>(filters?.status || 'all');
    const [dateFilter, setDateFilter] = useState(filters?.date || '');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const handleFilter = () => {
        router.get(
            appointmentIndex.url({
                query: {
                    search: searchQuery || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    date: dateFilter || undefined,
                }
            }),
            {},
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusUpdate = (appointmentId: number, newStatus: 'pending' | 'complete' | 'cancelled') => {
        router.patch(
            appointmentStatus.url(appointmentId),
            { status: newStatus },
            {
                preserveScroll: true,
                only: ['appointments'],
                onSuccess: () => {
                    // Status updated successfully
                },
                onError: (errors) => {
                    console.error('Failed to update status:', errors);
                    alert('Failed to update appointment status. Please try again.');
                },
            }
        );
    };

    const handleDelete = (appointmentId: number) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(
                appointmentDestroy.url(appointmentId),
                {
                    preserveState: true,
                    preserveScroll: true,
                    onError: (errors: any) => {
                        console.error('Failed to delete:', errors);
                    },
                }
            );
        }
    };

    const handlePrevious = () => {
        if (appointments.current_page > 1) {
            router.get(
                appointmentIndex.url({
                    query: {
                        search: searchQuery || undefined,
                        status: statusFilter !== 'all' ? statusFilter : undefined,
                        date: dateFilter || undefined,
                        page: appointments.current_page - 1,
                    }
                }),
                {},
                { preserveState: true }
            );
        }
    };

    const handleNext = () => {
        if (appointments.current_page < appointments.last_page) {
            router.get(
                appointmentIndex.url({
                    query: {
                        search: searchQuery || undefined,
                        status: statusFilter !== 'all' ? statusFilter : undefined,
                        date: dateFilter || undefined,
                        page: appointments.current_page + 1,
                    }
                }),
                {},
                { preserveState: true }
            );
        }
    };

    const handleViewDetails = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setDetailsOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Appointments
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and track all appointment requests
                    </p>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                        <CardDescription>
                            Search and filter appointments by school name, status, or date
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Search Input */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search school name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    router.get(
                                        appointmentIndex.url({
                                            query: {
                                                search: searchQuery || undefined,
                                                status: e.target.value !== 'all' ? e.target.value : undefined,
                                                date: dateFilter || undefined,
                                            }
                                        }),
                                        {},
                                        { preserveState: true }
                                    );
                                }}
                                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="complete">Complete</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            {/* Date Filter */}
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => {
                                    setDateFilter(e.target.value);
                                    router.get(
                                        appointmentIndex.url({
                                            query: {
                                                search: searchQuery || undefined,
                                                status: statusFilter !== 'all' ? statusFilter : undefined,
                                                date: e.target.value || undefined,
                                            }
                                        }),
                                        {},
                                        { preserveState: true }
                                    );
                                }}
                                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments Grid */}
                {appointments.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {appointments.data.map((appointment) => {
                            const status = statusConfig[appointment.status];

                            return (
                                <Card key={appointment.id} className="hover:shadow-md transition-shadow flex flex-col">
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
                                                        onClick={() => handleStatusUpdate(appointment.id, 'pending')}
                                                        disabled={appointment.status === 'pending'}
                                                    >
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusUpdate(appointment.id, 'complete')}
                                                        disabled={appointment.status === 'complete'}
                                                    >
                                                        Mark as Complete
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                                        disabled={appointment.status === 'cancelled'}
                                                    >
                                                        Mark as Cancelled
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(appointment.id)}
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
                                                    {appointment.file_count} {appointment.file_count === 1 ? 'file' : 'files'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Total files
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
                                            onClick={() => handleViewDetails(appointment)}
                                        >
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="p-3 rounded-full bg-muted mb-4">
                                <Calendar className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No appointments found
                            </h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                {searchQuery || statusFilter !== 'all' || dateFilter
                                    ? 'Try adjusting your filters to see more results.'
                                    : 'There are no appointments scheduled at this time.'}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {appointments.data.length > 0 && (
                    <Card>
                        <CardContent className="flex items-center justify-between py-4">
                            <p className="text-sm text-muted-foreground">
                                Showing page {appointments.current_page} of {appointments.last_page} ({appointments.total} total)
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevious}
                                    disabled={appointments.current_page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={appointments.current_page === appointments.last_page}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Dialog
                    open={detailsOpen}
                    onOpenChange={(open) => {
                        setDetailsOpen(open);
                        if (!open) setSelectedAppointment(null);
                    }}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Appointment Details</DialogTitle>
                            <DialogDescription>
                                {selectedAppointment?.user?.name ||
                                    selectedAppointment?.school_name ||
                                    'Appointment'}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedAppointment ? (
                            <div className="grid gap-4">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-md border p-3">
                                        <div className="text-xs text-muted-foreground">School</div>
                                        <div className="font-medium">
                                            {selectedAppointment.school_name}
                                        </div>
                                    </div>
                                    <div className="rounded-md border p-3">
                                        <div className="text-xs text-muted-foreground">Status</div>
                                        <div className="pt-1">
                                            <Badge
                                                variant={statusConfig[selectedAppointment.status].variant}
                                                className={statusConfig[selectedAppointment.status].className}
                                            >
                                                {statusConfig[selectedAppointment.status].label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-md border p-3">
                                        <div className="text-xs text-muted-foreground">Appointment Date</div>
                                        <div className="font-medium">
                                            {new Date(
                                                selectedAppointment.appointment_date,
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
                                            {selectedAppointment.file_count}{' '}
                                            {selectedAppointment.file_count === 1 ? 'file' : 'files'}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-md border p-3">
                                    <div className="text-xs text-muted-foreground">Reason</div>
                                    <div className="mt-1 text-sm">
                                        {selectedAppointment.reason || '—'}
                                    </div>
                                </div>

                                {selectedAppointment.user?.name || selectedAppointment.user?.profile_photo_path ? (
                                    <div className="rounded-md border p-3">
                                        <div className="text-xs text-muted-foreground">Requested By</div>
                                        <div className="mt-2 flex items-center gap-3">
                                            {selectedAppointment.user?.profile_photo_path ? (
                                                <img
                                                    src={`/storage/${selectedAppointment.user.profile_photo_path}`}
                                                    alt={selectedAppointment.user.name}
                                                    className="h-10 w-10 rounded-full object-cover border"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                            )}
                                            <div className="font-medium">
                                                {selectedAppointment.user?.name}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <DialogFooter>
                            {selectedAppointment ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setDetailsOpen(false);
                                            setSelectedAppointment(null);
                                        }}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleStatusUpdate(selectedAppointment.id, 'complete');
                                            setDetailsOpen(false);
                                            setSelectedAppointment(null);
                                        }}
                                    >
                                        Mark as Complete
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                                    Close
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
