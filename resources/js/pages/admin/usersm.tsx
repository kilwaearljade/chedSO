import AppLayout from '@/layouts/app-layout';
import { schoolslist } from '@/routes';
import { type BreadcrumbItem, type User } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'School',
        href: schoolslist().url,
    },
];

interface SchoolProps {
    users?: User[];
}

export default function School({ users = [] }: SchoolProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School - User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                User Management
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Manage registered users
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-900">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-80 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            Email Verified
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
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar && (
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.name}
                                                                className="h-10 w-10 rounded-full"
                                                            />
                                                        )}
                                                        <span className="font-medium">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.email_verified_at ? (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            Not Verified
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-4">
                                                        <button className="text-blue-600 hover:underline dark:text-blue-400">
                                                            Edit
                                                        </button>
                                                        <button className="text-red-600 hover:underline dark:text-red-400">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

