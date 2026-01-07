import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'HistoryLog',
        href: dashboard().url,
    },

];

export default function HistoryLog() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Login History
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Track and monitor all login activities across your account
                            </p>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
                        <div className="relative z-10 p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

                                {/* Search */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by IP, location, device..."
                                            className="block w-full rounded-lg border border-gray-300 dark:border-neutral-600
                                            bg-white dark:bg-neutral-900 px-4 py-2 pl-10 text-sm
                                            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <svg className="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        className="block w-full rounded-lg border border-gray-300 dark:border-neutral-600
                                        bg-white dark:bg-neutral-900 px-4 py-2 text-sm
                                        text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option>All Status</option>
                                        <option>Success</option>
                                        <option>Failed</option>
                                        <option>Blocked</option>
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date Range
                                    </label>
                                    <select
                                        className="block w-full rounded-lg border border-gray-300 dark:border-neutral-600
                                        bg-white dark:bg-neutral-900 px-4 py-2 text-sm
                                        text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option>All Time</option>
                                        <option>Today</option>
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                        <option>This Year</option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Login History Table */}
                    <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">

                        <div className="relative z-10 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-neutral-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">

                                    {/* Sample Row */}
                                    <tr className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                                            <div className="font-medium">Jan 05, 2026</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                10:15 AM
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-full
                                                bg-green-100 dark:bg-green-900/30
                                                px-2.5 py-1 text-xs font-medium
                                                text-green-700 dark:text-green-300">
                                                Success
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Empty State */}
                                    <tr>
                                        <td colSpan={2} className="px-6 py-12 text-center text-gray-400">
                                            No login history found
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 shadow-sm">
                            <div className="relative z-10">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Logins
                                </div>
                                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    1,245
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
