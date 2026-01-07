import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: dashboard().url,
    },

];

export default function Accounts() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Account Management
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Manage registered school accounts
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-900">
                        <input
                            type="text"
                            placeholder="Search by school name or email..."
                            className="w-80 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {/* Accounts Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            School Name
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            Registered Date
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y dark:divide-gray-700">

                                    {[
                                        {
                                            name: 'Sample School',
                                            email: 'school@email.com',
                                            date: 'Jan 10, 2026',
                                        },
                                        {
                                            name: 'Another School',
                                            email: 'admin@school.edu',
                                            date: 'Feb 02, 2026',
                                        },
                                    ].map((account, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="px-6 py-4">
                                                {account.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {account.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {account.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-4">
                                                    <button className="text-blue-600 hover:underline">
                                                        Update
                                                    </button>
                                                    <button className="text-red-600 hover:underline">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Update Modal (UI Only) */}
                    <div className="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
                            <h2 className="mb-4 text-xl font-semibold">
                                Update Account
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm">
                                        School Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm">
                                        New Password <span className="text-xs text-gray-500">(optional)</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button className="rounded-lg border px-4 py-2">
                                        Cancel
                                    </button>
                                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
