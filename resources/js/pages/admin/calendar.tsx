import AppLayout from '@/layouts/app-layout';
import { calendar } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router, useForm } from '@inertiajs/react';
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
    date: string; // YYYY-MM-DD format
    description?: string;
    color: string;
    type: 'event' | 'appointment'; // To distinguish between admin events and school appointments
    school_name?: string; // For appointments - which school created it
    status?: string; // For appointments - pending/cancelled/complete
}

interface CalendarPageProps {
    events: CalendarEvent[];
    appointments: CalendarEvent[];
}

export default function Calendar({ events: initialEvents = [], appointments: initialAppointments = [] }: CalendarPageProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';

    // Combine events and appointments into one array
    const allItems = [
        ...initialEvents.map(e => ({ ...e, type: 'event' as const })),
        ...initialAppointments.map(a => ({ ...a, type: 'appointment' as const }))
    ];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [selectedDateFull, setSelectedDateFull] = useState<Date | null>(null);
    const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
    const [isAddEventSheetOpen, setIsAddEventSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form for creating events using Inertia
    const { data, setData, post, processing, reset } = useForm({
        event_name: '',
        event_date: '',
        description: '',
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Set default date when selectedDateFull changes
    useEffect(() => {
        if (selectedDateFull) {
            setData('event_date', selectedDateFull.toISOString().split('T')[0]);
        }
    }, [selectedDateFull]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today.getDate());
    };

    const getItemsForDate = (dateObj: Date): CalendarEvent[] => {
        const dateString = dateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        return allItems.filter(item => item.date === dateString);
    };

    const handleDateClick = (day: number, monthOffset: number = 0) => {
        const newDate = new Date(currentYear, currentMonth + monthOffset, day);
        setCurrentDate(new Date(currentYear, currentMonth + monthOffset, 1));
        setSelectedDate(day);
        setSelectedDateFull(newDate);
        setIsDateSheetOpen(true);
    };

    const getSelectedDateItems = () => {
        if (!selectedDateFull) return [];
        return getItemsForDate(selectedDateFull);
    };

    const formatSelectedDate = () => {
        if (!selectedDateFull) return '';
        return `${monthNames[selectedDateFull.getMonth()]} ${selectedDateFull.getDate()}, ${selectedDateFull.getFullYear()}`;
    };

    const handleSubmitEvent = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Submitting event:', data);

        post('/calendar/events', {
            onSuccess: () => {
                console.log('Event created successfully!');
                reset();
                setIsAddEventSheetOpen(false);
                router.reload();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                alert('Error: ' + JSON.stringify(errors));
            },
        });
    };

    const handleDeleteEvent = (itemId: number, itemType: 'event' | 'appointment') => {
        if (!confirm(`Are you sure you want to delete this ${itemType}?`)) return;

        const url = itemType === 'event'
            ? `/calendar/events/${itemId}`
            : `/calendar/appointments/${itemId}`;

        router.delete(url, {
            onSuccess: () => {
                console.log(`${itemType} deleted successfully!`);
                router.reload();
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                alert(`Error deleting ${itemType}`);
            },
        });
    };

    // Filter items based on search query
    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.school_name && item.school_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderCalendarDays = () => {
        const days = [];
        const totalCells = 42; // 6 weeks × 7 days

        // Calculate previous month's last days
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

        // Days from previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const day = daysInPrevMonth - firstDayOfMonth + i + 1;
            const date = new Date(prevYear, prevMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const dayItems = getItemsForDate(date);

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
                        {dayItems.slice(0, 2).map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${item.color}`}
                                title={item.name}
                            >
                                {item.name}
                            </div>
                        ))}
                        {dayItems.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayItems.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = day === selectedDate && currentMonth === selectedDateFull?.getMonth();
            const dayItems = getItemsForDate(date);

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
                        {dayItems.slice(0, 2).map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${item.color}`}
                                title={item.name}
                            >
                                {item.name}
                            </div>
                        ))}
                        {dayItems.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayItems.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Days from next month
        const remainingCells = totalCells - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const day = i;
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const date = new Date(nextYear, nextMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const dayItems = getItemsForDate(date);

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
                        {dayItems.slice(0, 2).map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${item.color}`}
                                title={item.name}
                            >
                                {item.name}
                            </div>
                        ))}
                        {dayItems.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayItems.length - 2} more
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

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

        // Days from previous month
        for (let i = 0; i < firstDay; i++) {
            const day = daysInPrevMonth - firstDay + i + 1;
            const date = new Date(prevYear, prevMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const hasItems = getItemsForDate(date).length > 0;

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
                    {hasItems && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            );
        }

        // Days of current month
        for (let day = 1; day <= lastDate; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const hasItems = getItemsForDate(date).length > 0;
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = day === selectedDate && currentMonth === selectedDateFull?.getMonth();

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
                    {hasItems && (
                        <span className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                            isSelected ? 'bg-primary-foreground' : 'bg-primary'
                        }`} />
                    )}
                </button>
            );
        }

        // Days from next month
        const totalDaysShown = firstDay + lastDate;
        const remainingCells = Math.ceil(totalDaysShown / 7) * 7 - totalDaysShown;
        for (let i = 1; i <= remainingCells; i++) {
            const day = i;
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const date = new Date(nextYear, nextMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const hasItems = getItemsForDate(date).length > 0;

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
                    {hasItems && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            );
        }

        return miniDays;
    };

    // Get upcoming items sorted by date (filtered by search)
    const upcomingItems = filteredItems
        .filter(item => new Date(item.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

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
                                    Events & Appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Mini Calendar */}
                                <div>
                                    <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
                                        {dayNamesShort.map((day, index) => (
                                            <div key={`day-header-${index}-${day}`} className="h-8 flex items-center justify-center">
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
                                        placeholder="Search events & appointments..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-muted/50 px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Upcoming Items */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Upcoming Items
                                    </h3>
                                    <div className="space-y-2">
                                        {upcomingItems.length > 0 ? (
                                            upcomingItems.map((item) => (
                                                <div
                                                    key={`${item.type}-${item.id}`}
                                                    className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 cursor-pointer hover:bg-muted/50"
                                                    onClick={() => {
                                                        const itemDate = new Date(item.date);
                                                        setCurrentDate(new Date(itemDate.getFullYear(), itemDate.getMonth(), 1));
                                                        setSelectedDate(itemDate.getDate());
                                                        setSelectedDateFull(itemDate);
                                                        setIsDateSheetOpen(true);
                                                    }}
                                                >
                                                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {item.name}
                                                            </p>
                                                            <Badge variant={item.type === 'event' ? 'default' : 'secondary'} className="h-5 px-1.5 text-xs">
                                                                {item.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        {item.school_name && (
                                                            <p className="text-xs text-muted-foreground">
                                                                By: {item.school_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                {searchQuery ? 'No items found' : 'No upcoming items'}
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
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedDateFull(new Date());
                                                setIsAddEventSheetOpen(true);
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Event
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Date Items Sheet */}
                                <Sheet open={isDateSheetOpen} onOpenChange={setIsDateSheetOpen}>
                                    <SheetContent className="overflow-auto">
                                        <SheetHeader>
                                            <SheetTitle>
                                                Schedule for {formatSelectedDate()}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {getSelectedDateItems().length > 0
                                                    ? `${getSelectedDateItems().length} item(s) scheduled for this date.`
                                                    : 'No items scheduled for this date.'}
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-4">
                                            {getSelectedDateItems().length > 0 ? (
                                                <div className="space-y-3">
                                                    {getSelectedDateItems().map((item) => (
                                                        <div
                                                            key={`${item.type}-${item.id}`}
                                                            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className={`h-3 w-3 rounded-full mt-1.5 ${item.color}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="text-sm font-semibold text-foreground">
                                                                        {item.name}
                                                                    </h4>
                                                                    <Badge variant={item.type === 'event' ? 'default' : 'secondary'} className="h-5 px-1.5 text-xs">
                                                                        {item.type}
                                                                    </Badge>
                                                                </div>
                                                                {item.description && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                                {item.school_name && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Created by: {item.school_name}
                                                                    </p>
                                                                )}
                                                                {item.status && (
                                                                    <Badge variant="outline" className="mt-2">
                                                                        {item.status}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {isAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteEvent(item.id, item.type)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No items scheduled for this date.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
                                            {isAdmin && (
                                                <Button
                                                    onClick={() => {
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
                                                Fill in the details below to create a new event.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <form onSubmit={handleSubmitEvent}>
                                            <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="event_name">Event Title</Label>
                                                    <Input
                                                        id="event_name"
                                                        placeholder="Enter event title"
                                                        value={data.event_name}
                                                        onChange={(e) => setData('event_name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="event_date">Date</Label>
                                                    <Input
                                                        id="event_date"
                                                        type="date"
                                                        value={data.event_date}
                                                        onChange={(e) => setData('event_date', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="description">Description (optional)</Label>
                                                    <textarea
                                                        id="description"
                                                        placeholder="Enter event description"
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <SheetFooter className="mt-6">
                                                <Button type="submit" disabled={processing}>
                                                    {processing ? 'Saving...' : 'Save Event'}
                                                </Button>
                                                <SheetClose asChild>
                                                    <Button variant="outline" type="button">Cancel</Button>
                                                </SheetClose>
                                            </SheetFooter>
                                        </form>
                                    </SheetContent>
                                </Sheet>

                                {/* Days Header */}
                                <div className="mb-2 grid grid-cols-7 gap-2 border-b border-border pb-2">
                                    {dayNames.map((day, index) => (
                                        <div
                                            key={`day-name-${index}-${day}`}
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
