import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { useState } from 'react';
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
        href: dashboard().url,
    },
];

// Mock appointments data - replace with real data from props/API
const mockAppointments = [
    { id: 1, name: 'Sample Appointment', date: 5, color: 'bg-primary' },
    { id: 2, name: 'Meeting', date: 12, color: 'bg-blue-500' },
    { id: 3, name: 'Consultation', date: 18, color: 'bg-green-500' },
    { id: 4, name: 'Review', date: 25, color: 'bg-purple-500' },
];

export default function Calendar() {
    const { auth } = usePage<SharedData>().props;
    const isSchool = auth.user.role === 'school';

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [selectedDateFull, setSelectedDateFull] = useState<Date | null>(null);
    const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
    const [isAddAppointmentSheetOpen, setIsAddAppointmentSheetOpen] = useState(false);
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

    const getAppointmentsForDate = (date: number, month?: number, year?: number) => {
        // For now, filter by date number only (mock data limitation)
        // In production, filter by full date (year, month, day)
        return mockAppointments.filter(appointment => appointment.date === date);
    };

    const handleDateClick = (day: number, monthOffset: number = 0) => {
        const newDate = new Date(currentYear, currentMonth + monthOffset, day);
        setCurrentDate(newDate);
        setSelectedDate(day);
        setSelectedDateFull(newDate);
        setIsDateSheetOpen(true);
    };

    const getSelectedDateAppointments = () => {
        if (!selectedDateFull) return [];
        return getAppointmentsForDate(selectedDateFull.getDate(), selectedDateFull.getMonth(), selectedDateFull.getFullYear());
    };

    const formatSelectedDate = () => {
        if (!selectedDateFull) return '';
        return `${monthNames[selectedDateFull.getMonth()]} ${selectedDateFull.getDate()}, ${selectedDateFull.getFullYear()}`;
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
            const appointments = getAppointmentsForDate(day);

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
                        {appointments.slice(0, 2).map((appointment) => (
                            <div
                                key={appointment.id}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${appointment.color}`}
                                title={appointment.name}
                            >
                                {appointment.name}
                            </div>
                        ))}
                        {appointments.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{appointments.length - 2} more
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
            const appointments = getAppointmentsForDate(day);

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
                        {appointments.slice(0, 2).map((appointment) => (
                            <div
                                key={appointment.id}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${appointment.color}`}
                                title={appointment.name}
                            >
                                {appointment.name}
                            </div>
                        ))}
                        {appointments.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{appointments.length - 2} more
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
            const appointments = getAppointmentsForDate(day);

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
                        {appointments.slice(0, 2).map((appointment) => (
                            <div
                                key={appointment.id}
                                className={`truncate rounded px-2 py-1 text-xs font-medium text-white ${appointment.color}`}
                                title={appointment.name}
                            >
                                {appointment.name}
                            </div>
                        ))}
                        {appointments.length > 2 && (
                            <div className="text-xs text-muted-foreground font-medium">
                                +{appointments.length - 2} more
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
            const hasAppointment = mockAppointments.some(appointment => appointment.date === day);

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
                    {hasAppointment && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            );
        }

        // Days of current month
        for (let day = 1; day <= lastDate; day++) {
            const hasAppointment = mockAppointments.some(appointment => appointment.date === day);
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
                    {hasAppointment && (
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
            const hasAppointment = mockAppointments.some(appointment => appointment.date === day);

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
                    {hasAppointment && (
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
                                    Select a date to view appointments
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
                                        placeholder="Search appointments..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-muted/50 px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Upcoming Appointments */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Upcoming Appointments
                                    </h3>
                                    <div className="space-y-2">
                                        {mockAppointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className="flex items-center gap-2 rounded-lg border border-border bg-card p-2"
                                            >
                                                <div className={`h-2 w-2 rounded-full ${appointment.color}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {appointment.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {monthNames[currentMonth]} {appointment.date}, {currentYear}
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

                                    {isSchool && (
                                        <Sheet open={isAddAppointmentSheetOpen} onOpenChange={setIsAddAppointmentSheetOpen}>
                                            <SheetTrigger asChild>
                                                <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Appointment</Button>
                                            </SheetTrigger>
                                            <SheetContent className="overflow-auto">
                                                <SheetHeader>
                                                    <SheetTitle>Add New Appointment</SheetTitle>
                                                    <SheetDescription>
                                                        Fill in the details below to create a new appointment.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-6">
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="add-appointment-title">Appointment title</Label>
                                                        <Input id="add-appointment-title" placeholder="Enter appointment title" />
                                                    </div>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="add-appointment-date">Date</Label>
                                                        <Input
                                                            id="add-appointment-date"
                                                            type="date"
                                                            defaultValue={selectedDateFull ? selectedDateFull.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="add-appointment-description">Description (optional)</Label>
                                                        <textarea
                                                            id="add-appointment-description"
                                                            placeholder="Enter appointment description"
                                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        />
                                                    </div>
                                                </div>
                                                <SheetFooter className="mt-6">
                                                    <Button type="submit" onClick={() => {
                                                        // Handle save appointment logic here
                                                        setIsAddAppointmentSheetOpen(false);
                                                    }}>
                                                        Save Appointment
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
                                {/* Date Appointments Sheet */}
                                <Sheet open={isDateSheetOpen} onOpenChange={setIsDateSheetOpen}>
                                    <SheetContent className="overflow-auto">
                                        <SheetHeader>
                                            <SheetTitle>
                                                Appointments and Schedule for {formatSelectedDate()}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {getSelectedDateAppointments().length > 0
                                                    ? `You have ${getSelectedDateAppointments().length} appointment(s) on this date.`
                                                    : 'No appointments scheduled for this date.'}
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6 space-y-4">
                                            {getSelectedDateAppointments().length > 0 ? (
                                                <div className="space-y-3">
                                                    {getSelectedDateAppointments().map((appointment) => (
                                                        <div
                                                            key={appointment.id}
                                                            className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className={`h-3 w-3 rounded-full mt-1.5 ${appointment.color}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-foreground">
                                                                    {appointment.name}
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatSelectedDate()}
                                                                </p>
                                                            </div>
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
                                                <Button
                                                    onClick={() => {
                                                        setIsDateSheetOpen(false);
                                                        setIsAddAppointmentSheetOpen(true);
                                                    }}
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" /> Add Appointment
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

                                {/* Add Appointment Sheet */}
                                <Sheet open={isAddAppointmentSheetOpen} onOpenChange={setIsAddAppointmentSheetOpen}>
                                    <SheetContent className="overflow-auto">
                                        <SheetHeader>
                                            <SheetTitle>Add New Appointment</SheetTitle>
                                            <SheetDescription>
                                                Fill in the details below to create a new appointment for {formatSelectedDate()}.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="grid flex-1 auto-rows-min gap-6 px-4 mt-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="appointment-title">Appointment title</Label>
                                                <Input id="appointment-title" placeholder="Enter appointment title" />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="appointment-date">Date</Label>
                                                <Input
                                                    id="appointment-date"
                                                    type="date"
                                                    defaultValue={selectedDateFull ? selectedDateFull.toISOString().split('T')[0] : ''}
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="appointment-description">Description (optional)</Label>
                                                <textarea
                                                    id="appointment-description"
                                                    placeholder="Enter appointment description"
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                        <SheetFooter className="mt-6">
                                            <Button type="submit" onClick={() => {
                                                // Handle save appointment logic here
                                                setIsAddAppointmentSheetOpen(false);
                                            }}>
                                                Save Appointment
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
