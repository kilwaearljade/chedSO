import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendar',
        href: dashboard().url,
    },
];

// Mock events data - replace with real data from props/API
const mockEvents = [
    { id: 1, name: 'Sample Event', date: 5, color: 'bg-primary' },
    { id: 2, name: 'Meeting', date: 12, color: 'bg-blue-500' },
    { id: 3, name: 'Appointment', date: 18, color: 'bg-green-500' },
    { id: 4, name: 'Conference', date: 25, color: 'bg-purple-500' },
];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [searchQuery, setSearchQuery] = useState('');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today.getDate());
    };

    const getEventsForDate = (date: number) => {
        return mockEvents.filter(event => event.date === date);
    };

    const renderCalendarDays = () => {
        const days = [];
        const totalCells = 42; // 6 weeks × 7 days
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(
                <div
                    key={`empty-${i}`}
                    className="min-h-[120px] rounded-lg border border-border bg-muted/30 p-2 opacity-50"
                />
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            const isSelected = day === selectedDate;
            const events = getEventsForDate(day);

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[120px] rounded-lg border border-border p-2 transition-all cursor-pointer hover:bg-muted/50 ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    } ${isToday ? 'bg-primary/10 border-primary/50' : 'bg-card'}`}
                >
                    <div className={`mb-2 flex items-center justify-between`}>
                        <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                            {day}
                        </span>
                        {isToday && (
                            <Badge variant="default" className="h-5 px-1.5 text-xs">
                                Today
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-1">
                        {events.slice(0, 2).map((event) => (
                            <div
                                key={event.id}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${event.color}`}
                                title={event.name}
                            >
                                {event.name}
                            </div>
                        ))}
                        {events.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{events.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Fill remaining cells to complete the grid
        const remainingCells = totalCells - days.length;
        for (let i = 0; i < remainingCells; i++) {
            days.push(
                <div
                    key={`empty-after-${i}`}
                    className="min-h-[120px] rounded-lg border border-border bg-muted/30 p-2 opacity-50"
                />
            );
        }

        return days;
    };

    const renderMiniCalendarDays = () => {
        const miniDays = [];
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            miniDays.push(<div key={`mini-empty-${i}`} className="h-8" />);
        }

        // Days
        for (let day = 1; day <= lastDate; day++) {
            const hasEvent = mockEvents.some(event => event.date === day);
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth();
            const isSelected = day === selectedDate;

            miniDays.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        isSelected
                            ? 'bg-primary text-primary-foreground'
                            : isToday
                            ? 'bg-primary/20 text-primary font-semibold'
                            : 'hover:bg-muted text-foreground'
                    }`}
                >
                    {day}
                    {hasEvent && (
                        <span className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                            isSelected ? 'bg-primary-foreground' : 'bg-primary'
                        }`} />
                    )}
                </button>
            );
        }

        return miniDays;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                    {/* LEFT SIDEBAR */}
                    <aside className="w-full lg:w-80">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        {monthNames[currentMonth]} {currentYear}
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToToday}
                                        className="h-8 w-8"
                                    >
                                        <Clock className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardDescription>
                                    Select a date to view events
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Mini Calendar */}
                                <div>
                                    <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
                                        {dayNamesShort.map((day) => (
                                            <div key={day} className="h-8 flex items-center justify-center">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                        {renderMiniCalendarDays()}
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search events..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-muted/50 px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Upcoming Events */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Upcoming Events
                                    </h3>
                                    <div className="space-y-2">
                                        {mockEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                                            >
                                                <div className={`h-2 w-2 rounded-full ${event.color}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {event.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {monthNames[currentMonth]} {event.date}, {currentYear}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* MAIN CALENDAR */}
                    <section className="flex-1">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    {/* Toolbar */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => navigateMonth('prev')}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={goToToday}
                                        >
                                            Today
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => navigateMonth('next')}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <CardTitle className="text-2xl font-bold">
                                        {monthNames[currentMonth]} {currentYear}
                                    </CardTitle>

                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Event
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Days Header */}
                                <div className="mb-2 grid grid-cols-7 gap-2 border-b border-border pb-2">
                                    {dayNames.map((day) => (
                                        <div
                                            key={day}
                                            className="text-center text-sm font-semibold text-muted-foreground"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {renderCalendarDays()}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
