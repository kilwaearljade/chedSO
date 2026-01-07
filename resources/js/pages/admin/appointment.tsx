import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointment',
        href: dashboard().url,
    },

];

export default function Appointment() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Appointments
                        </h1>
                    </div>

                    {/* Filter Form (UI only) */}
                    <form className="bg-dark rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <input
                                type="text"
                                placeholder="Search school name..."
                                className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white
                                border border-gray-700 focus:ring-2 focus:ring-blue-600"
                            />

                            <select
                                className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white
                                border border-gray-700 focus:ring-2 focus:ring-blue-600"
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Complete</option>
                                <option>Cancelled</option>
                            </select>

                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white
                                border border-gray-700 focus:ring-2 focus:ring-blue-600"
                            />
                        </div>

                        <div className="mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Filter
                            </button>
                        </div>
                    </form>

                    {/* Appointments Table */}
                    <div className="bg-dark rounded-lg shadow-md overflow-hidden">

                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-white">
                                        School Name
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-white">
                                        Appointment Date
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-white">
                                        File Count
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-white">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-white">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-700">

                                {/* Sample Row */}
                                <tr>
                                    <td className="px-6 py-4 text-white">
                                        Sample School Name
                                    </td>

                                    <td className="px-6 py-4 text-white">
                                        Jan 01, 2026
                                    </td>

                                    <td className="px-6 py-4 text-white">
                                        3
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600 text-white">
                                            Pending
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <button className="px-3 py-1 bg-blue-600 text-white rounded">
                                            Update
                                        </button>
                                    </td>
                                </tr>

                                {/* Empty State */}
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-gray-400"
                                    >
                                        No appointments found.
                                    </td>
                                </tr>

                            </tbody>
                        </table>

                        {/* Pagination Placeholder */}
                        <div className="px-6 py-4 border-t border-gray-700 text-gray-400 text-sm">
                            Pagination here
                        </div>

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
