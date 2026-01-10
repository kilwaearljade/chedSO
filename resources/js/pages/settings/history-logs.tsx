import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useState } from 'react';

interface Account {
    id: number;
    name: string;
    email: string;
    registered_at: string;
    registered_date: string;
    registered_time: string;
    is_approved: boolean;
    approved_at: string | null;
    approved_date: string | null;
    approved_time: string | null;
    status: 'approved' | 'pending';
}

interface HistoryLogsProps {
    accounts: Account[];
    stats: {
        total_registered: number;
        total_approved: number;
        total_pending: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'History Logs',
        href: '/settings/history-logs',
    },
];

export default function HistoryLogs({ accounts = [], stats }: HistoryLogsProps) {
    const { auth } = usePage<SharedData>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Filter accounts based on search and status
    const filteredAccounts = accounts.filter((account) => {
        const matchesSearch =
            account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || account.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History Logs" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Account Registration & Approval History"
                        description="View all account registrations and approval status"
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm">
                            <div className="relative z-10">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Registered
                                </div>
                                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.total_registered || 0}
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm">
                            <div className="relative z-10">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Approved Accounts
                                </div>
                                <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.total_approved || 0}
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm">
                            <div className="relative z-10">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Pending Approval
                                </div>
                                <div className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {stats.total_pending || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
                        <div className="relative z-10 p-4 space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                {/* Search */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
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

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 dark:border-neutral-600
                                        bg-white dark:bg-neutral-900 px-4 py-2 text-sm
                                        text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accounts History Table */}
                    <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
                        <div className="relative z-10 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-neutral-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            Account
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            Registered Date
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            Approved Date
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {filteredAccounts.length > 0 ? (
                                        filteredAccounts.map((account) => (
                                            <tr
                                                key={account.id}
                                                className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {account.name}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {account.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-white">
                                                    <div className="font-medium">{account.registered_date}</div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {account.registered_time}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-white">
                                                    {account.approved_date ? (
                                                        <>
                                                            <div className="font-medium">{account.approved_date}</div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {account.approved_time}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            Not approved
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            account.is_approved
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                                        }`}
                                                    >
                                                        {account.is_approved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                No accounts found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

