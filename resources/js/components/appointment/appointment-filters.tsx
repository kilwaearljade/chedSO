import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { router } from '@inertiajs/react';
import { index as appointmentIndex } from '@/routes/appointment';

interface AppointmentFiltersProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    dateFilter: string;
    setDateFilter: (value: string) => void;
    onFilter: () => void;
}

export default function AppointmentFilters({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    onFilter,
}: AppointmentFiltersProps) {
    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            appointmentIndex.url({
                query: {
                    search: searchQuery || undefined,
                    status: value !== 'all' ? value : undefined,
                    date: dateFilter || undefined,
                }
            }),
            {},
            { preserveState: true }
        );
    };

    const handleDateChange = (value: string) => {
        setDateFilter(value);
        router.get(
            appointmentIndex.url({
                query: {
                    search: searchQuery || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    date: value || undefined,
                }
            }),
            {},
            { preserveState: true }
        );
    };

    return (
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
                            onKeyDown={(e) => e.key === 'Enter' && onFilter()}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
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
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
