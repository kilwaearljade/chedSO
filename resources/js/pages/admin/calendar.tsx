import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendar',
        href: dashboard().url,
    },

];

export default function Calendar() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full h-full gap-4">

                    {/* LEFT SIDEBAR */}
                    <aside className="w-64 rounded-xl bg-blue-700 p-4 text-white space-y-4">

                        {/* Month / Year */}
                        <div className="text-xl font-bold text-center">
                            January 2026
                        </div>

                        {/* Mini Calendar */}
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {['S','M','T','W','T','F','S'].map((d) => (
                                <div key={d} className="font-semibold text-blue-200">{d}</div>
                            ))}
                            {Array.from({ length: 31 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded cursor-pointer p-1 hover:bg-blue-600"
                                >
                                    {i + 1}
                                    <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-white"></div>
                                </div>
                            ))}
                        </div>

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search schedule..."
                            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white placeholder-blue-200 focus:outline-none"
                        />
                    </aside>

                    {/* MAIN CALENDAR */}
                    <section className="flex-1 rounded-xl bg-white p-4 shadow">

                        {/* Toolbar */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex gap-2">
                                <button className="rounded px-3 py-1 bg-blue-100">‹</button>
                                <button className="rounded px-3 py-1 bg-blue-100">›</button>
                                <button className="rounded bg-blue-600 px-3 py-1 text-white">
                                    Today
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-blue-700">
                                January 2026
                            </h2>

                            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                                Add Event
                            </button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 border-b pb-2 text-center font-semibold text-blue-700">
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="mt-2 grid grid-cols-7 gap-2">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-28 rounded-lg border p-2 hover:bg-blue-50 cursor-pointer"
                                >
                                    <div className="text-right text-sm font-semibold text-blue-700">
                                        {i < 31 ? i + 1 : ''}
                                    </div>

                                    <div className="mt-2 text-xs text-gray-500">
                                        Sample Event
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </div>
        </AppLayout>
    );
}
