import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, FileText, Building2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointment',
        href: dashboard().url,
    },
];

// Mock appointments data - replace with real data from props/API
const appointments = [
    {
        id: 1,
        schoolName: 'Sample School Name',
        appointmentDate: 'Jan 01, 2026',
        fileCount: 3,
        status: 'pending',
    },
    {
        id: 2,
        schoolName: 'Another School',
        appointmentDate: 'Jan 15, 2026',
        fileCount: 5,
        status: 'complete',
    },
    {
        id: 3,
        schoolName: 'High School XYZ',
        appointmentDate: 'Feb 01, 2026',
        fileCount: 2,
        status: 'pending',
    },
    {
        id: 4,
        schoolName: 'Elementary School ABC',
        appointmentDate: 'Dec 20, 2025',
        fileCount: 8,
        status: 'cancelled',
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

export default function Appointment() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState('');

    const filteredAppointments = appointments.filter((appointment) => {
        const matchesSearch = appointment.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
        const matchesDate = !dateFilter || appointment.appointmentDate.includes(dateFilter);
        
        return matchesSearch && matchesStatus && matchesDate;
    });

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
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
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
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appointments Grid */}
                {filteredAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAppointments.map((appointment) => {
                            const status = statusConfig[appointment.status as keyof typeof statusConfig];
                            
                            return (
                                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg line-clamp-1">
                                                        {appointment.schoolName}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        Appointment #{appointment.id}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Appointment Date */}
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {appointment.appointmentDate}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Appointment Date
                                                </p>
                                            </div>
                                        </div>

                                        {/* File Count */}
                                        <div className="flex items-center gap-3 text-sm">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {appointment.fileCount} {appointment.fileCount === 1 ? 'file' : 'files'}
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
                                            onClick={() => {
                                                // Handle update action
                                                console.log('Update appointment:', appointment.id);
                                            }}
                                        >
                                            Update Status
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

                {/* Pagination Placeholder */}
                {filteredAppointments.length > 0 && (
                    <Card>
                        <CardContent className="flex items-center justify-between py-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {filteredAppointments.length} of {appointments.length} appointments
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                    Next
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
