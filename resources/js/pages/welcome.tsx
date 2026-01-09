import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Settings, Calendar, Users, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: Zap,
            title: 'Fast Performance',
            description: 'Optimized system speed with secure and reliable access for seamless user experience.',
        },
        {
            icon: Shield,
            title: 'Secure System',
            description: 'Built-in protection against unauthorized access with advanced security measures.',
        },
        {
            icon: Settings,
            title: 'Fully Manageable',
            description: 'Easily manage users, schedules, and reports with an intuitive interface.',
        },
        {
            icon: Calendar,
            title: 'Easy Scheduling',
            description: 'Streamlined appointment booking system for efficient schedule management.',
        },
        {
            icon: Users,
            title: 'User Management',
            description: 'Comprehensive user management tools for administrators and staff.',
        },
        {
            icon: BarChart3,
            title: 'Analytics & Reports',
            description: 'Detailed analytics and reporting features to track and analyze data.',
        },
    ];

    const benefits = [
        'Streamlined appointment process',
        'Real-time availability tracking',
        'Automated notifications',
        'Secure data management',
        'Mobile-responsive design',
        '24/7 system accessibility',
    ];

    return (
        <>
            <Head title="Welcome - CHED XII Special-Order">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                    <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <Link href="#" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                            <div className="flex items-center gap-2">
                                <img
                                    src="/images/1.png"
                                    alt="CHED XII Logo"
                                    className="h-10 w-10 lg:h-12 lg:w-12"
                                />
                                <img
                                    src="/images/2.png"
                                    alt="CHED XII Logo"
                                    className="h-10 w-10 lg:h-12 lg:w-12"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground lg:text-xl">
                                    CHED XII
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Special-Order
                                </p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>Go to Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild>
                                            <Link href={register()}>Register</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background py-10 lg:py-10">
                        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                                {/* Hero Content */}
                                <div className="space-y-8 text-center lg:text-left">
                                    <Badge variant="outline" className="mb-4">
                                        Welcome to CHED XII
                                    </Badge>
                                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                        Special-Order{' '}
                                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                            Appointment System
                                        </span>
                                    </h1>
                                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground lg:mx-0">
                                        A modern digital platform designed to manage school appointments
                                        efficiently with CHED. Schedule visits, monitor availability,
                                        and manage requests securely with advanced features.
                                    </p>

                                    {!auth.user ? (
                                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                                            <Button size="lg" asChild>
                                                <Link href={register()}>
                                                    Get Started Free
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button size="lg" variant="outline" asChild>
                                                <Link href={login()}>Sign In</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center lg:justify-start">
                                            <Button size="lg" asChild>
                                                <Link href={dashboard()}>
                                                    Go to Dashboard
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-6 pt-8">
                                        {[
                                            { label: 'Commitment', value: '100%' },
                                            { label: 'Excellence', value: '100%' },
                                            { label: 'Dedication', value: '100%' },
                                        ].map((stat) => (
                                            <div key={stat.label} className="text-center lg:text-left">
                                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hero Image */}
                                <div className="relative">
                                    <Card className="overflow-hidden shadow-2xl">
                                        <CardContent className="p-0">
                                            <img
                                                src="/images/4.jpg"
                                                alt="CHED XII Special-Order System"
                                                className="h-full w-full object-cover"
                                            />
                                        </CardContent>
                                    </Card>
                                    <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-3xl"></div>
                                    <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-primary/10 blur-3xl"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="py-20 lg:py-32">
                        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center">
                                <Badge variant="outline" className="mb-4">
                                    Features
                                </Badge>
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                    Everything You Need
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Powerful features designed to streamline your appointment management
                                    process and enhance productivity.
                                </p>
                            </div>

                            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature) => {
                                    const Icon = feature.icon;
                                    return (
                                        <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <CardTitle>{feature.title}</CardTitle>
                                                <CardDescription>{feature.description}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Benefits Section */}
                    <section className="border-y border-border bg-muted/50 py-20 lg:py-32">
                        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                                <div>
                                    <Badge variant="outline" className="mb-4">
                                        Why Choose Us
                                    </Badge>
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                        Benefits That Matter
                                    </h2>
                                    <p className="mt-4 text-lg text-muted-foreground">
                                        Experience the advantages of our comprehensive appointment management system
                                        designed specifically for CHED XII operations.
                                    </p>
                                    <ul className="mt-8 space-y-4">
                                        {benefits.map((benefit) => (
                                            <li key={benefit} className="flex items-start gap-3">
                                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                                <span className="text-foreground">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Card className="p-8 lg:p-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                                <Calendar className="h-8 w-8 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">Easy Appointment Booking</h3>
                                                <p className="text-muted-foreground">Book appointments in just a few clicks</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                                <Users className="h-8 w-8 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">User-Friendly Interface</h3>
                                                <p className="text-muted-foreground">Intuitive design for all users</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                                <BarChart3 className="h-8 w-8 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">Real-Time Analytics</h3>
                                                <p className="text-muted-foreground">Track and monitor all activities</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 lg:py-32">
                        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                            <Card className="border-none bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-2xl">
                                <CardContent className="p-12 text-center lg:p-16">
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                        Ready to Get Started?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
                                        Experience a smarter way of handling appointments with
                                        the CHED XII Special-Order system today.
                                    </p>
                                    {!auth.user ? (
                                        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                                            <Button size="lg" variant="secondary" asChild>
                                                <Link href={register()}>
                                                    Create Account
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
                                                <Link href={login()}>Already Registered?</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="mt-10 flex justify-center">
                                            <Button size="lg" variant="secondary" asChild>
                                                <Link href={dashboard()}>
                                                    Go to Dashboard
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </main>

                <AppFooter />
            </div>
        </>
    );
}
