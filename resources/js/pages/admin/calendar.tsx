import AppLayout from '@/layouts/app-layout';
import { calendar } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendar',
        href: calendar().url,
    },
];

interface CalendarEvent {
    id: number;
    name: string;
    date: string;
    day: string;
    description?: string;
    color: string;
}

interface CalendarPageProps {
    events?: CalendarEvent[];
}

export default function Calendar({ events: initialEvents = [] }: CalendarPageProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';

    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [selectedDateFull, setSelectedDateFull] = useState<Date | null>(null);
    const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
    const [isAddEventSheetOpen, setIsAddEventSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Form state
    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDescription, setEventDescription] = useState('');

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

    // Refresh events from server
    const refreshEvents = () => {
        router.reload({
            only: ['events'],
            onSuccess: (page) => {
                const props = page.props as unknown as SharedData & CalendarPageProps;
                if (props.events) {
                    setEvents(props.events);
                }
            },
        });
    };

    const getEventsForDate = (day: number, month?: number, year?: number) => {
        const targetDate = new Date(year || currentYear, (month !== undefined ? month : currentMonth), day);
        const dateString = targetDate.toISOString().split('T')[0];
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                   eventDate.getMonth() === (month !== undefined ? month : currentMonth) &&
                   eventDate.getFullYear() === (year || currentYear);
        });
    };

    const handleDateClick = (day: number, monthOffset: number = 0) => {
        const newDate = new Date(currentYear, currentMonth + monthOffset, day);
        setCurrentDate(newDate);
        setSelectedDate(day);
        setSelectedDateFull(newDate);
        setIsDateSheetOpen(true);
    };

    const getSelectedDateEvents = () => {
        if (!selectedDateFull) return [];
        return getEventsForDate(selectedDateFull.getDate(), selectedDateFull.getMonth(), selectedDateFull.getFullYear());
    };

    const formatSelectedDate = () => {
        if (!selectedDateFull) return '';
        return `${monthNames[selectedDateFull.getMonth()]} ${selectedDateFull.getDate()}, ${selectedDateFull.getFullYear()}`;
    };

    // Helper to read CSRF token from cookie (for fetch requests)
    const getCsrfToken = (): string => {
        const name = 'XSRF-TOKEN';
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() ?? '';
        return '';
    };

    const handleSaveEvent = async () => {
        if (!eventTitle || !eventDate) return;

        setLoading(true);
        try {
            const response = await fetch('/calendar/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    event_name: eventTitle,
                    event_date: eventDate,
                    description: eventDescription || null,
                }),
            });

            if (!response.ok) {
                // Try to parse the response for error details
                let err = null;
                try {
                    err = await response.json();
                } catch (e) {
                    // ignore
                }
                console.error('Failed to save event', err || response.statusText);
                return;
            }

            const data = await response.json();

            if (data.success) {
                refreshEvents();
                setIsAddEventSheetOpen(false);
                setEventTitle('');
                setEventDate('');
                setEventDescription('');
            }
        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        setLoading(true);
        try {
            const response = await fetch(`/calendar/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                let err = null;
                try {
                    err = await response.json();
                } catch (e) {
                    // ignore
                }
                console.error('Failed to delete event', err || response.statusText);
                return;
            }

            const data = await response.json();

            if (data.success) {
                refreshEvents();
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCalendarDays = () => {
        const days = [];
        const totalCells = 42; // 6 weeks × 7 days

        // Calculate previous month's last days
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

        // Days from previous month (before the first day of current month)
        for (let i = 0; i < firstDayOfMonth; i++) {
            const day = daysInPrevMonth - firstDayOfMonth + i + 1;
            const date = new Date(prevYear, prevMonth, day);
            const isToday = date.getDate() === new Date().getDate() &&
                           date.getMonth() === new Date().getMonth() &&
                           date.getFullYear() === new Date().getFullYear();
            const dayEvents = getEventsForDate(day, prevMonth, prevYear);

            days.push(
                <div
                    key={`prev-${day}`}
                    onClick={() => handleDateClick(day, -1)}
                    className={`min-h-[120px] rounded-lg border border-border bg-muted/30 p-2 transition-all cursor-pointer hover:bg-muted/50 opacity-60 ${
                        isToday ? 'bg-primary/10 border-primary/50 opacity-80' : ''
                    }`}
                >
                    <div className={`mb-2 flex items-center justify-between`}>
                        <span className={`text-sm font-semibold text-muted-foreground ${isToday ? 'text-primary' : ''}`}>
                            {day}
                        </span>
                        {isToday && (
                            <Badge variant="default" className="h-5 px-1.5 text-xs">
                                Today
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                            <div
                                key={event.id}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${event.color}`}
                                title={event.name}
                            >
                                {event.name}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayEvents.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            const isSelected = day === selectedDate;
            const dayEvents = getEventsForDate(day);

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day, 0)}
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
                        {dayEvents.slice(0, 2).map((event) => (
                            <div
                                key={event.id}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${event.color}`}
                                title={event.name}
                            >
                                {event.name}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayEvents.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Days from next month (to complete the grid)
        const remainingCells = totalCells - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const day = i;
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const date = new Date(nextYear, nextMonth, day);
            const isToday = date.getDate() === new Date().getDate() &&
                           date.getMonth() === new Date().getMonth() &&
                           date.getFullYear() === new Date().getFullYear();
            const dayEvents = getEventsForDate(day, nextMonth, nextYear);

            days.push(
                <div
                    key={`next-${day}`}
                    onClick={() => handleDateClick(day, 1)}
                    className={`min-h-[120px] rounded-lg border border-border bg-muted/30 p-2 transition-all cursor-pointer hover:bg-muted/50 opacity-60 ${
                        isToday ? 'bg-primary/10 border-primary/50 opacity-80' : ''
                    }`}
                >
                    <div className={`mb-2 flex items-center justify-between`}>
                        <span className={`text-sm font-semibold text-muted-foreground ${isToday ? 'text-primary' : ''}`}>
                            {day}
                        </span>
                        {isToday && (
                            <Badge variant="default" className="h-5 px-1.5 text-xs">
                                Today
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                            <div
                                key={event.id}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${event.color}`}
                                title={event.name}
                            >
                                {event.name}
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayEvents.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const renderMiniCalendarDays = () => {
        const miniDays = [];
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Calculate previous month's last days
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

        // Days from previous month
        for (let i = 0; i < firstDay; i++) {
            const day = daysInPrevMonth - firstDay + i + 1;
            const date = new Date(prevYear, prevMonth, day);
            const isToday = date.getDate() === new Date().getDate() &&
                           date.getMonth() === new Date().getMonth() &&
                           date.getFullYear() === new Date().getFullYear();
            const dayEvents = getEventsForDate(day, prevMonth, prevYear);
            const hasEvent = dayEvents.length > 0;

            miniDays.push(
                <button
                    key={`mini-prev-${day}`}
                    onClick={() => handleDateClick(day, -1)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors opacity-60 hover:opacity-100 ${
                        isToday
                            ? 'bg-primary/20 text-primary font-semibold opacity-80'
                            : 'hover:bg-muted text-muted-foreground'
                    }`}
                >
                    {day}
                    {hasEvent && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            );
        }

        // Days of current month
        for (let day = 1; day <= lastDate; day++) {
            const dayEvents = getEventsForDate(day);
            const hasEvent = dayEvents.length > 0;
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            const isSelected = day === selectedDate;

            miniDays.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day, 0)}
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

        // Days from next month (to complete the grid - only fill to complete weeks)
        const totalDaysShown = firstDay + lastDate;
        const remainingCells = Math.ceil(totalDaysShown / 7) * 7 - totalDaysShown;
        for (let i = 1; i <= remainingCells; i++) {
            const day = i;
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const date = new Date(nextYear, nextMonth, day);
            const isToday = date.getDate() === new Date().getDate() &&
                           date.getMonth() === new Date().getMonth() &&
                           date.getFullYear() === new Date().getFullYear();
            const dayEvents = getEventsForDate(day, nextMonth, nextYear);
            const hasEvent = dayEvents.length > 0;

            miniDays.push(
                <button
                    key={`mini-next-${day}`}
                    onClick={() => handleDateClick(day, 1)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors opacity-60 hover:opacity-100 ${
                        isToday
                            ? 'bg-primary/20 text-primary font-semibold opacity-80'
                            : 'hover:bg-muted text-muted-foreground'
                    }`}
                >
                    {day}
                    {hasEvent && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
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
                                        {events
                                            .filter(event => {
                                                const eventDate = new Date(event.date);
                                                return eventDate.getMonth() === currentMonth &&
                                                       eventDate.getFullYear() === currentYear;
                                            })
                                            .slice(0, 5)
                                            .map((event) => {
                                                const eventDate = new Date(event.date);
                                                return (
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
                                                                {monthNames[eventDate.getMonth()]} {eventDate.getDate()}, {eventDate.getFullYear()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        {events.filter(event => {
                                            const eventDate = new Date(event.date);
                                            return eventDate.getMonth() === currentMonth &&
                                                   eventDate.getFullYear() === currentYear;
                                        }).length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No upcoming events
                                            </p>
                                        )}
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

                                    {isAdmin && (
                                    <Sheet open={isAddEventSheetOpen} onOpenChange={(open) => {
                                        setIsAddEventSheetOpen(open);
                                        if (!open) {
                                            setEventTitle('');
                                            setEventDate('');
                                            setEventDescription('');
                                        }
                                    }}>
                                        <SheetTrigger asChild>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setEventDate(new Date().toISOString().split('T')[0]);
                                                    setEventTitle('');
                                                    setEventDescription('');
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Event
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent className="overflow-auto">
                                            <SheetHeader>
                                                <SheetTitle>Add New Event</SheetTitle>
                                                <SheetDescription>
                                                    Fill in the details below to create a new event.
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="add-event-title">Event title</Label>
                                                    <Input
                                                        id="add-event-title"
                                                        placeholder="Enter event title"
                                                        value={eventTitle}
                                                        onChange={(e) => setEventTitle(e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="add-event-date">Date</Label>
                                                    <Input
                                                        id="add-event-date"
                                                        type="date"
                                                        value={eventDate || (selectedDateFull ? selectedDateFull.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])}
                                                        onChange={(e) => setEventDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="add-event-description">Description (optional)</Label>
                                                    <textarea
                                                        id="add-event-description"
                                                        placeholder="Enter event description"
                                                        value={eventDescription}
                                                        onChange={(e) => setEventDescription(e.target.value)}
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                            <SheetFooter className="mt-6">
                                                <Button
                                                    type="submit"
                                                    onClick={handleSaveEvent}
                                                    disabled={loading || !eventTitle || !eventDate}
                                                >
                                                    {loading ? 'Saving...' : 'Save Event'}
                                                </Button>
                                                <SheetClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </SheetClose>
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Date Events Sheet */}
                                <Sheet open={isDateSheetOpen} onOpenChange={setIsDateSheetOpen}>
                                    <SheetContent className="overflow-auto">
                                        <SheetHeader>
                                            <SheetTitle>
                                                Events and Schedule for {formatSelectedDate()}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {getSelectedDateEvents().length > 0
                                                    ? `You have ${getSelectedDateEvents().length} event(s) on this date.`
                                                    : 'No events scheduled for this date.'}
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-4">
                                            {getSelectedDateEvents().length > 0 ? (
                                                <div className="space-y-3">
                                                    {getSelectedDateEvents().map((event) => (
                                                        <div
                                                            key={event.id}
                                                            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className={`h-3 w-3 rounded-full mt-1.5 ${event.color}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-foreground">
                                                                    {event.name}
                                                                </h4>
                                                                {event.description && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {event.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                    disabled={loading}
                                                                >
                                                                    ×
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No events scheduled for this date.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
                                            {isAdmin && (
                                            <Button
                                                onClick={() => {
                                                    setEventDate(selectedDateFull ? selectedDateFull.toISOString().split('T')[0] : '');
                                                    setEventTitle('');
                                                    setEventDescription('');
                                                    setIsDateSheetOpen(false);
                                                    setIsAddEventSheetOpen(true);
                                                }}
                                                className="w-full sm:w-auto"
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Event
                                            </Button>
                                            )}
                                            <SheetClose asChild>
                                                <Button variant="outline" className="w-full sm:w-auto">
                                                    Close
                                                </Button>
                                            </SheetClose>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>

                                {/* Add Event Sheet */}
                                <Sheet open={isAddEventSheetOpen} onOpenChange={setIsAddEventSheetOpen}>
                                    <SheetContent className="overflow-auto">
                                        <SheetHeader>
                                            <SheetTitle>Add New Event</SheetTitle>
                                            <SheetDescription>
                                                Fill in the details below to create a new event for {formatSelectedDate()}.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="event-title">Event title</Label>
                                                <Input
                                                    id="event-title"
                                                    placeholder="Enter event title"
                                                    value={eventTitle}
                                                    onChange={(e) => setEventTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="event-date">Date</Label>
                                                <Input
                                                    id="event-date"
                                                    type="date"
                                                    value={eventDate || (selectedDateFull ? selectedDateFull.toISOString().split('T')[0] : '')}
                                                    onChange={(e) => setEventDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="event-description">Description (optional)</Label>
                                                <textarea
                                                    id="event-description"
                                                    placeholder="Enter event description"
                                                    value={eventDescription}
                                                    onChange={(e) => setEventDescription(e.target.value)}
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                        <SheetFooter className="mt-6">
                                            <Button
                                                type="submit"
                                                onClick={handleSaveEvent}
                                                disabled={loading || !eventTitle || !eventDate}
                                            >
                                                {loading ? 'Saving...' : 'Save Event'}
                                            </Button>
                                            <SheetClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </SheetClose>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>
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
