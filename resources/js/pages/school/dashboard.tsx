import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    MessageCircle,
    FileText,
    Clock,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Stat {
    label: string;
    value: number;
    icon: string;
}

interface Appointment {
    id: number;
    title: string;
    date: string;
    time: string;
    status: string;
}

interface Props {
    stats: Stat[];
    upcomingAppointments: Appointment[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'School Home',
        href: '#',
    },
];

const quickLinks = [
    {
        label: 'Book New Appointment',
        description: 'Schedule a new visit with CHED XII.',
        icon: Calendar,
    },
    {
        label: 'View Submitted Documents',
        description: 'Review and track your uploaded documents.',
        icon: FileText,
    },
    {
        label: 'Open Messages',
        description: 'Contact the CHED XII admin through messages.',
        icon: MessageCircle,
    },
];

const iconMap: { [key: string]: React.ComponentType<{ className: string }> } = {
    Calendar,
    MessageCircle,
    FileText,
    Clock,
    CheckCircle2,
};

export default function SchoolHome({ stats, upcomingAppointments }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Home" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            School Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Overview of your appointments, documents, and messages with CHED XII.
                        </p>
                    </div>
                    <Button className="self-start">
                        Book New Appointment
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Top Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => {
                        const Icon = iconMap[stat.icon];
                        return (
                            <Card key={stat.label} className="flex flex-col justify-between">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.label}
                                    </CardTitle>
                                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Upcoming Appointments */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Upcoming Appointments
                            </CardTitle>
                            <CardDescription>
                                Your next scheduled visits with CHED XII.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {appointment.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {appointment.date} • {appointment.time}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {appointment.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    You have no upcoming appointments scheduled.
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="outline" size="sm">
                                View All Appointments
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Quick Links / Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>
                                Shortcuts for common school tasks.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {quickLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        className="flex w-full items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-left transition hover:bg-muted"
                                    >
                                        <span className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span>
                                            <p className="text-sm font-semibold text-foreground">
                                                {item.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </span>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}


