import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, Filter, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendar',
        href: dashboard().url,
    },
];

interface Appointment {
    id: number;
    name: string;
    date: string; // 'Y-m-d' format
    day: number;
    description: string | null;
    status: string;
    color: string;
    file_count: number;
    daily_file_count: number | null;
    is_split: boolean;
    split_sequence: number | null;
    total_splits: number | null;
    parent_appointment_id: number | null;
    assigned_by?: number;
}

interface CalendarEvent {
    id: number;
    name: string;
    date: string; // 'Y-m-d' format
    description: string | null;
    color: string;
    type: 'event' | 'appointment';
}

interface CalendarProps {
    appointments: Appointment[];
    events: CalendarEvent[];
}

export default function Calendar({ appointments = [], events = [] }: CalendarProps) {
    const { auth } = usePage<SharedData>().props;
    const isSchool = auth.user.role === 'school';

    // Combine appointments and events into one array
    const allItems = [
        ...appointments.map(a => ({ ...a, type: 'appointment' as const })),
        ...events.map(e => ({ ...e, type: 'event' as const, status: undefined }))
    ];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [selectedDateFull, setSelectedDateFull] = useState<Date | null>(null);
    const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
    const [isAddAppointmentSheetOpen, setIsAddAppointmentSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [capacityCheck, setCapacityCheck] = useState<{
        available: boolean;
        capacity_used: number;
        capacity_available: number;
        capacity_total: number;
        message: string;
        reason: string;
        checking: boolean;
    } | null>(null);
    const [selectedDateCapacity, setSelectedDateCapacity] = useState<{
        capacity_used: number;
        capacity_available: number;
        capacity_total: number;
        is_full: boolean;
    } | null>(null);

    // Form for creating appointments
    const { data, setData, post, processing, reset, errors } = useForm({
        school_name: '',
        appointment_date: '',
        reason: '',
        file_count: 1,
    });

    // Helper function to check if a date has an event
    const hasEventOnDate = (dateString: string): boolean => {
        if (!dateString) return false;
        return events.some(event => event.date === dateString);
    };

    // Helper function to get event name on a date
    const getEventOnDate = (dateString: string): CalendarEvent | undefined => {
        return events.find(event => event.date === dateString);
    };

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
            const year = selectedDateFull.getFullYear();
            const month = String(selectedDateFull.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDateFull.getDate()).padStart(2, '0');
            setData('appointment_date', `${year}-${month}-${day}`);
        }
    }, [selectedDateFull]);

    // Check capacity when date or file count changes
    useEffect(() => {
        const checkCapacity = async () => {
            if (!data.appointment_date || !data.file_count) {
                setCapacityCheck(null);
                return;
            }

            setCapacityCheck(prev => prev ? { ...prev, checking: true } : null);

            try {
                const response = await fetch(
                    `/school/calendar/check-capacity?date=${data.appointment_date}&file_count=${data.file_count}`,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'same-origin',
                    }
                );

                if (response.ok) {
                    const result = await response.json();
                    setCapacityCheck({ ...result, checking: false });
                } else {
                    setCapacityCheck(null);
                }
            } catch (error) {
                console.error('Error checking capacity:', error);
                setCapacityCheck(null);
            }
        };

        const timeoutId = setTimeout(() => {
            checkCapacity();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [data.appointment_date, data.file_count]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today.getDate());
    };

    const getAppointmentsForDate = (dateObj: Date) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return allItems.filter(item => item.date === dateString);
    };

    const handleDateClick = async (day: number, monthOffset: number = 0) => {
        const newDate = new Date(currentYear, currentMonth + monthOffset, day);
        setCurrentDate(new Date(currentYear, currentMonth + monthOffset, 1));
        setSelectedDate(day);
        setSelectedDateFull(newDate);
        setIsDateSheetOpen(true);

        // Check capacity for the selected date
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(newDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        try {
            const response = await fetch(
                `/school/calendar/check-capacity?date=${dateString}&file_count=1`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                }
            );

            if (response.ok) {
                const result = await response.json();
                setSelectedDateCapacity({
                    capacity_used: result.capacity_used,
                    capacity_available: result.capacity_available,
                    capacity_total: result.capacity_total,
                    is_full: result.capacity_available === 0 || ['past_or_today', 'weekend', 'event'].includes(result.reason)
                });
            }
        } catch (error) {
            console.error('Error checking date capacity:', error);
            setSelectedDateCapacity(null);
        }
    };

    const getSelectedDateAppointments = () => {
        if (!selectedDateFull) return [];
        return getAppointmentsForDate(selectedDateFull);
    };

    const formatSelectedDate = () => {
        if (!selectedDateFull) return '';
        return `${monthNames[selectedDateFull.getMonth()]} ${selectedDateFull.getDate()}, ${selectedDateFull.getFullYear()}`;
    };

    const handleSubmitAppointment = (e: React.FormEvent) => {
        e.preventDefault();

        post('/school/calendar/appointments', {
            onSuccess: () => {
                reset();
                setIsAddAppointmentSheetOpen(false);
                router.reload();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
        });
    };

    const handleDeleteAppointment = (appointmentId: number) => {
        if (confirm('Are you sure you want to delete this appointment?')) {
            router.delete(`/school/calendar/appointments/${appointmentId}`, {
                onSuccess: () => {
                    setIsDateSheetOpen(false);
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    alert('Error deleting appointment');
                },
            });
        }
    };

    // Filter items based on search query
    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
            const dayAppointments = getAppointmentsForDate(date);

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
                        {dayAppointments.slice(0, 2).map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${item.color}`}
                                title={item.name}
                            >
                                {item.name}
                            </div>
                        ))}
                        {dayAppointments.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayAppointments.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${dayStr}`;
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = day === selectedDate && currentMonth === selectedDateFull?.getMonth() && currentYear === selectedDateFull?.getFullYear();
            const dayAppointments = getAppointmentsForDate(date);
            const hasEvent = hasEventOnDate(dateString);

            days.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day, 0)}
                    className={`min-h-[120px] rounded-lg border p-2 transition-all cursor-pointer hover:bg-muted/50 ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    } ${isToday ? 'bg-primary/10 border-primary/50' : 'bg-card'} ${
                        hasEvent ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                    }`}
                >
                    <div className={`mb-2 flex items-center justify-between`}>
                        <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                            {day}
                        </span>
                        <div className="flex items-center gap-1">
                            {hasEvent && (
                                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                    Event
                                </Badge>
                            )}
                            {isToday && (
                                <Badge variant="default" className="h-5 px-1.5 text-xs">
                                    Today
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${item.color}`}
                                title={item.name}
                            >
                                {item.name}
                            </div>
                        ))}
                        {dayAppointments.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayAppointments.length - 2} more
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
            const dayAppointments = getAppointmentsForDate(date);

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
                        {dayAppointments.slice(0, 2).map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${item.color}`}
                                title={item.name}
                            >
                                {item.name}
                            </div>
                        ))}
                        {dayAppointments.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{dayAppointments.length - 2} more
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
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${dayStr}`;
            const isToday = date.toDateString() === new Date().toDateString();
            const hasAppointment = getAppointmentsForDate(date).length > 0;
            const hasEvent = hasEventOnDate(dateString);

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
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-destructive" />
                    )}
                    {!hasEvent && hasAppointment && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            );
        }

        // Days of current month
        for (let day = 1; day <= lastDate; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${dayStr}`;
            const hasAppointment = getAppointmentsForDate(date).length > 0;
            const hasEvent = hasEventOnDate(dateString);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = day === selectedDate && currentMonth === selectedDateFull?.getMonth() && currentYear === selectedDateFull?.getFullYear();

            miniDays.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day, 0)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        isSelected
                            ? 'bg-primary text-primary-foreground'
                            : isToday
                            ? 'bg-primary/20 text-primary font-semibold'
                            : hasEvent
                            ? 'bg-destructive/20 text-destructive'
                            : 'hover:bg-muted text-foreground'
                    }`}
                    title={hasEvent ? `Event: ${getEventOnDate(dateString)?.name || 'Event'}` : ''}
                >
                    {day}
                    {hasEvent && (
                        <span className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                            isSelected ? 'bg-primary-foreground' : 'bg-destructive'
                        }`} />
                    )}
                    {!hasEvent && hasAppointment && (
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
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${dayStr}`;
            const isToday = date.toDateString() === new Date().toDateString();
            const hasAppointment = getAppointmentsForDate(date).length > 0;
            const hasEvent = hasEventOnDate(dateString);

            miniDays.push(
                <button
                    key={`mini-next-${day}`}
                    onClick={() => handleDateClick(day, 1)}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors opacity-60 hover:opacity-100 ${
                        isToday
                            ? 'bg-primary/20 text-primary font-semibold opacity-80'
                            : hasEvent
                            ? 'bg-destructive/20 text-destructive opacity-80'
                            : 'hover:bg-muted text-muted-foreground'
                    }`}
                    title={hasEvent ? `Event: ${getEventOnDate(dateString)?.name || 'Event'}` : ''}
                >
                    {day}
                    {hasEvent && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-destructive" />
                    )}
                    {!hasEvent && hasAppointment && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            );
        }

        return miniDays;
    };

    // Get upcoming items sorted by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingItems = filteredItems
        .filter(item => new Date(item.date) >= today)
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
                                    Select a date to view appointments
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
                                        placeholder="Search appointments..."
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

                                    {isSchool && (
                                        <div className="relative group">
                                            <Button
                                                variant="outline"
                                                onClick={async () => {
                                                    const today = new Date();
                                                    setSelectedDateFull(today);
                                                    
                                                    // Check capacity before opening
                                                    const year = today.getFullYear();
                                                    const month = String(today.getMonth() + 1).padStart(2, '0');
                                                    const day = String(today.getDate()).padStart(2, '0');
                                                    const dateString = `${year}-${month}-${day}`;
                                                    
                                                    try {
                                                        const response = await fetch(
                                                            `/school/calendar/check-capacity?date=${dateString}&file_count=1`,
                                                            {
                                                                headers: {
                                                                    'Accept': 'application/json',
                                                                    'X-Requested-With': 'XMLHttpRequest',
                                                                },
                                                                credentials: 'same-origin',
                                                            }
                                                        );
                                                        
                                                        if (response.ok) {
                                                            const result = await response.json();
                                                            setSelectedDateCapacity({
                                                                capacity_used: result.capacity_used,
                                                                capacity_available: result.capacity_available,
                                                                capacity_total: result.capacity_total,
                                                                is_full: result.capacity_available === 0 || ['past_or_today', 'weekend', 'event'].includes(result.reason)
                                                            });
                                                        }
                                                    } catch (error) {
                                                        console.error('Error checking capacity:', error);
                                                    }
                                                    
                                                    setIsAddAppointmentSheetOpen(true);
                                                }}
                                                disabled={
                                                    (selectedDateFull && new Date(selectedDateFull).toDateString() === new Date().toDateString()) ||
                                                    (selectedDateCapacity && selectedDateCapacity.is_full)
                                                }
                                                title={
                                                    selectedDateCapacity?.is_full 
                                                        ? `Date is full (${selectedDateCapacity.capacity_used}/${selectedDateCapacity.capacity_total} files used)` 
                                                        : selectedDateCapacity 
                                                            ? `Available: ${selectedDateCapacity.capacity_available}/${selectedDateCapacity.capacity_total} files`
                                                            : 'Add new appointment'
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" /> Add Appointment
                                            </Button>
                                            {selectedDateCapacity && (
                                                <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                                    selectedDateCapacity.is_full 
                                                        ? 'bg-red-500 text-white' 
                                                        : selectedDateCapacity.capacity_available < 50 
                                                            ? 'bg-yellow-500 text-white' 
                                                            : 'bg-green-500 text-white'
                                                }`}>
                                                    {selectedDateCapacity.capacity_available}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Date Appointments Sheet */}
                                <Sheet open={isDateSheetOpen} onOpenChange={setIsDateSheetOpen}>
                                    <SheetContent className="overflow-auto">
                                        <SheetHeader>
                                            <SheetTitle>
                                                Schedule for {formatSelectedDate()}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {getSelectedDateAppointments().length > 0
                                                    ? `${getSelectedDateAppointments().length} item(s) on this date.`
                                                    : 'No items scheduled for this date.'}
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-4">
                                            {getSelectedDateAppointments().length > 0 ? (
                                                <div className="space-y-3">
                                                    {getSelectedDateAppointments().map((item) => (
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
                                                                {item.status && (
                                                                    <Badge variant="outline" className="mt-2">
                                                                        {item.status}
                                                                    </Badge>
                                                                )}
                                                                {item.type === 'appointment' && item.is_split && (
                                                                    <div className="mt-2 space-y-1">
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Split {item.split_sequence}/{item.total_splits}
                                                                        </Badge>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            📁 {item.daily_file_count} files (of {item.file_count} total)
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {item.type === 'appointment' && !item.is_split && item.file_count && (
                                                                    <p className="text-xs text-muted-foreground mt-2">
                                                                        📁 {item.file_count} files
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {isSchool && item.type === 'appointment' && item.assigned_by === auth.user.id && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteAppointment(item.id)}
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
                                                        No appointments scheduled for this date.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
                                            {isSchool && (
                                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                    <Button
                                                        onClick={() => {
                                                            setIsDateSheetOpen(false);
                                                            setIsAddAppointmentSheetOpen(true);
                                                        }}
                                                        disabled={
                                                            (selectedDateFull && new Date(selectedDateFull).toDateString() === new Date().toDateString()) ||
                                                            (selectedDateCapacity && selectedDateCapacity.is_full)
                                                        }
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" /> Add Appointment
                                                    </Button>
                                                    {selectedDateCapacity && (
                                                        <div className={`text-xs text-center p-2 rounded-md ${
                                                            selectedDateCapacity.is_full 
                                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                                                                : selectedDateCapacity.capacity_available < 50 
                                                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' 
                                                                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                        }`}>
                                                            {selectedDateCapacity.is_full 
                                                                ? `⛔ Date is full (${selectedDateCapacity.capacity_used}/${selectedDateCapacity.capacity_total} files)`
                                                                : `✅ Available: ${selectedDateCapacity.capacity_available}/${selectedDateCapacity.capacity_total} files`
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <SheetClose asChild>
                                                <Button variant="outline" className="w-full sm:w-auto">
                                                    Close
                                                </Button>
                                            </SheetClose>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>

                                {/* Add Appointment Sheet */}
                                <Sheet open={isAddAppointmentSheetOpen} onOpenChange={setIsAddAppointmentSheetOpen}>
                                    <SheetContent className="overflow-auto">
                                        <SheetHeader>
                                            <SheetTitle>Add New Appointment</SheetTitle>
                                            <SheetDescription>
                                                Fill in the details below to create a new appointment.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <form onSubmit={handleSubmitAppointment}>
                                            <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="school_name">Appointment Title</Label>
                                                    <Input
                                                        id="school_name"
                                                        placeholder="Enter appointment title"
                                                        value={data.school_name}
                                                        onChange={(e) => setData('school_name', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors.school_name} />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="appointment_date">Date</Label>
                                                    <Input
                                                        id="appointment_date"
                                                        type="date"
                                                        value={data.appointment_date}
                                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                                        required
                                                        className={hasEventOnDate(data.appointment_date) ? 'border-yellow-500' : ''}
                                                    />
                                                    {hasEventOnDate(data.appointment_date) && (
                                                        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-2 rounded-md">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>
                                                                Warning: An event "{getEventOnDate(data.appointment_date)?.name || 'Event'}" is scheduled on this date.
                                                            </span>
                                                        </div>
                                                    )}
                                                    <InputError message={errors.appointment_date} />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="reason">Description (optional)</Label>
                                                    <textarea
                                                        id="reason"
                                                        placeholder="Enter appointment description"
                                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        value={data.reason}
                                                        onChange={(e) => setData('reason', e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="file_count">Number of Files</Label>
                                                    <Input
                                                        id="file_count"
                                                        type="number"
                                                        min="1"
                                                        max="10000"
                                                        placeholder="Enter number of files"
                                                        value={data.file_count}
                                                        onChange={(e) => setData('file_count', parseInt(e.target.value) || 1)}
                                                        required
                                                    />
                                                    <InputError message={errors.file_count} />
                                                    
                                                    {/* Capacity Check Display */}
                                                    {capacityCheck && !capacityCheck.checking && (
                                                        <div className={`flex flex-col gap-2 p-3 rounded-md border ${
                                                            capacityCheck.available 
                                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                        }`}>
                                                            <div className="flex items-center gap-2">
                                                                <AlertCircle className={`h-4 w-4 ${
                                                                    capacityCheck.available 
                                                                        ? 'text-green-600 dark:text-green-400' 
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }`} />
                                                                <span className={`text-sm font-medium ${
                                                                    capacityCheck.available 
                                                                        ? 'text-green-700 dark:text-green-300' 
                                                                        : 'text-red-700 dark:text-red-300'
                                                                }`}>
                                                                    {capacityCheck.message}
                                                                </span>
                                                            </div>
                                                            
                                                            {capacityCheck.reason === 'available' && (
                                                                <div className="text-xs text-muted-foreground space-y-1">
                                                                    <div className="flex justify-between">
                                                                        <span>Used:</span>
                                                                        <span className="font-medium">{capacityCheck.capacity_used} files</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Available:</span>
                                                                        <span className="font-medium text-green-600 dark:text-green-400">
                                                                            {capacityCheck.capacity_available} files
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Total Capacity:</span>
                                                                        <span className="font-medium">{capacityCheck.capacity_total} files/day</span>
                                                                    </div>
                                                                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div 
                                                                            className="h-full bg-green-500 transition-all" 
                                                                            style={{ 
                                                                                width: `${(capacityCheck.capacity_used / capacityCheck.capacity_total) * 100}%` 
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {capacityCheck.reason === 'capacity_full' && (
                                                                <div className="text-xs text-muted-foreground space-y-1">
                                                                    <div className="flex justify-between">
                                                                        <span>Requested:</span>
                                                                        <span className="font-medium">{capacityCheck.requested_files} files</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Available:</span>
                                                                        <span className="font-medium text-red-600 dark:text-red-400">
                                                                            {capacityCheck.capacity_available} files only
                                                                        </span>
                                                                    </div>
                                                                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                                                        💡 The system will auto-split to next available days
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {capacityCheck?.checking && (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                                                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                                                            <span>Checking availability...</span>
                                                        </div>
                                                    )}
                                                    
                                                    <p className="text-xs text-muted-foreground">
                                                        ℹ️ Appointments over 200 files will be automatically split across multiple days (200 files/day max, skipping weekends and event dates). Your selected date will receive the first 200 files.
                                                    </p>
                                                </div>
                                            </div>
                                            <SheetFooter className="mt-6">
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing || 
                                                        (capacityCheck && !capacityCheck.available && 
                                                         ['past_or_today', 'weekend', 'event'].includes(capacityCheck.reason))
                                                    }
                                                >
                                                    {processing ? 'Saving...' : 'Save Appointment'}
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
