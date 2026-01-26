import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as appointmentIndex, status as appointmentStatus, destroy as appointmentDestroy } from '@/routes/appointment';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import AppointmentFilters from '@/components/appointment/appointment-filters';
import AppointmentCard from '@/components/appointment/appointment-card';
import AppointmentDetailsDialog from '@/components/appointment/appointment-details-dialog';
import AppointmentPagination from '@/components/appointment/appointment-pagination';
import { type Appointment, type AppointmentProps } from '@/components/appointment/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointment',
        href: dashboard().url,
    },
];

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
                <AppointmentFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    onFilter={handleFilter}
                />

                {/* Appointments Grid */}
                {appointments.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {appointments.data.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onStatusUpdate={handleStatusUpdate}
                                onDelete={handleDelete}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
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
                    <AppointmentPagination
                        currentPage={appointments.current_page}
                        lastPage={appointments.last_page}
                        total={appointments.total}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                    />
                )}

                <AppointmentDetailsDialog
                    open={detailsOpen}
                    onOpenChange={(open) => {
                        setDetailsOpen(open);
                        if (!open) setSelectedAppointment(null);
                    }}
                    appointment={selectedAppointment}
                    onStatusUpdate={handleStatusUpdate}
                />
            </div>
        </AppLayout>
    );
}
