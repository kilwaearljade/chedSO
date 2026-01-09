import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-background text-foreground lg:justify-center">
                <header className="w-full bg-background shadow-lg">
                    <nav className="flex w-full items-center justify-between px-6 py-5 lg:px-12">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/1.png"
                                alt="CHED XII Logo"
                                className="h-10 w-10 lg:h-12 lg:w-12"/>
                            <img
                                src="/images/2.png"
                                alt="CHED XII Logo"
                                className="h-10 w-10 lg:h-12 lg:w-12"
                            />
                            <h2 className="text-xl font-bold text-foreground lg:text-2xl">
                                CHED XII
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-md"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-6 py-2.5 text-sm font-semibold bg-primary text-white transition-all hover:bg-background hover:text-primary border hover:border-primary hover:shadow-md"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-blue-50 hover:shadow-md"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>
                <div className="w-full p-6 lg:p-8">
                    <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                        <main className="w-full max-w-7xl px-6 lg:px-8">

                            {/* HERO SECTION */}
                            <section className="grid gap-14 py-24 lg:grid-cols-2 lg:items-center">

                                {/* TEXT */}
                                <div className="space-y-8">
                                    <h1 className="text-5xl font-extrabold leading-tight">
                                        Welcome to the
                                        <span className="mt-2 block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                            CHED XII Special-Order Appointment System
                                        </span>
                                    </h1>

                                    <p className="max-w-xl text-lg text-muted-foreground">
                                        A modern digital platform designed to manage school appointments
                                        efficiently with CHED. Schedule visits, monitor availability,
                                        and manage requests securely.
                                    </p>


                                    {!auth.user && (
                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            <Link
                                                href={login()}
                                                className="rounded-xl bg-blue-600 px-10 py-4 text-center font-semibold text-white transition hover:bg-blue-900"
                                            >
                                                Get Started Free
                                            </Link>

                                            <Link
                                                href={login()}
                                                className="rounded-xl border border-border px-10 py-4 text-center font-semibold transition hover:bg-secondary"
                                            >
                                                Sign In
                                            </Link>
                                        </div>
                                    )}

                                    {/* VALUES */}
                                    <div className="grid grid-cols-3 gap-6 pt-8 text-center">
                                        {['Commitment', 'Excellence', 'Dedication'].map((item) => (
                                            <p
                                                key={item}
                                                className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                                            >
                                                {item}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* IMAGE */}
                                <div className="relative hidden lg:block">
                                    <div className="rounded-3xl bg-card p-6 shadow-xl">
                                        <img
                                            src="/images/4.jpg"
                                            alt="CHED"
                                            className="w-full rounded-2xl object-cover"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* FEATURES */}
                            <section className="py-24">
                                <div className="mb-16 text-center">
                                    <h2 className="mb-4 text-4xl font-extrabold">About Us</h2>
                                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                        Everything you need to manage appointments securely,
                                        efficiently, and professionally.
                                    </p>
                                </div>

                                <div className="grid gap-10 md:grid-cols-3">
                                    {[
                                        {
                                            icon: '⚡',
                                            title: 'Fast Performance',
                                            desc: 'Optimized system speed with secure and reliable access.',
                                        },
                                        {
                                            icon: '🔒',
                                            title: 'Secure System',
                                            desc: 'Built-in protection against unauthorized access.',
                                        },
                                        {
                                            icon: '📦',
                                            title: 'Fully Manageable',
                                            desc: 'Easily manage users, schedules, and reports.',
                                        },
                                    ].map((feature) => (
                                        <div
                                            key={feature.title}
                                            className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-center text-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                                        >
                                            <div className="mb-6 text-3xl">
                                                {feature.icon}
                                            </div>

                                            <h3 className="mb-3 text-xl font-bold">
                                                {feature.title}
                                            </h3>

                                            <p className="text-white/90">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                            </section>

                            {/* CTA */}
                            <section className="py-24">
                                <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800 p-14 text-center text-white shadow-xl">
                                    <h2 className="mb-6 text-4xl font-extrabold">
                                        Ready to Get Started?
                                    </h2>

                                    <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">
                                        Experience a smarter way of handling appointments with
                                        the CHED XII system today.
                                    </p>

                                    {!auth.user ? (
                                        <div className="flex flex-col justify-center gap-5 sm:flex-row">
                                            <Link
                                                href={register()}
                                                className="rounded-xl bg-white px-10 py-4 font-semibold text-indigo-600 transition hover:bg-blue-50"
                                            >
                                                Create Account
                                            </Link>
                                            <Link
                                                href={login()}
                                                className="rounded-xl border border-white/40 px-10 py-4 font-semibold text-white transition hover:bg-white/20"
                                            >
                                                Already Registered?
                                            </Link>
                                        </div>
                                    ) : (
                                        <Link
                                            href={dashboard()}
                                            className="rounded-xl bg-white px-10 py-4 font-semibold text-indigo-600 transition hover:bg-blue-50"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    )}
                                </div>
                            </section>
                        </main>
                    </div>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
