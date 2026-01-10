import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { schoolslist } from '@/routes';
import { approve, decline } from '@/routes/schools';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';

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
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setIsSheetOpen(true);
    };

    const handleApprove = () => {
        if (selectedUser) {
            router.patch(approve.url({ user: selectedUser.id }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSheetOpen(false);
                    setSelectedUser(null);
                },
            });
        }
    };

    const handleDecline = () => {
        if (selectedUser) {
            router.patch(decline.url({ user: selectedUser.id }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSheetOpen(false);
                    setSelectedUser(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School - User Management" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                School Management
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Manage registered schools
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
                                            Approval Status
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase">
                                            Approval Date
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
                                                    {user.is_approve ? (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Approved
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.is_approve ? (
                                                        new Date(user.updated_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">Not approved</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleViewUser(user)}
                                                        aria-label="View user details"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
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

                    {/* User View Sheet */}
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetContent side="right" className="w-full sm:max-w-lg">
                            <SheetHeader>
                                <SheetTitle>User Details</SheetTitle>
                                <SheetDescription>
                                    View and manage user information
                                </SheetDescription>
                            </SheetHeader>

                            {selectedUser && (
                                <div className="mt-6 space-y-6">
                                    {/* User Avatar and Name */}
                                    <div className="flex items-center gap-4">
                                        {selectedUser.avatar ? (
                                            <img
                                                src={selectedUser.avatar}
                                                alt={selectedUser.name}
                                                className="h-20 w-20 rounded-full"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {selectedUser.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {selectedUser.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                User ID: {selectedUser.id}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* User Information */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Mail className="mt-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Email
                                                </p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {selectedUser.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Approval Status
                                                </p>
                                                <p className="text-base">
                                                    {selectedUser.email_verified_at ? (
                                                        <span className="text-green-600 dark:text-green-400">
                                                            Verified on{' '}
                                                            {new Date(selectedUser.email_verified_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-yellow-600 dark:text-yellow-400">
                                                            Not Verified
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Calendar className="mt-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Approval Date
                                                </p>
                                                <p className="text-base text-gray-900 dark:text-white">
                                                    {selectedUser.is_approve ? (
                                                        new Date(selectedUser.updated_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">Not approved</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedUser.two_factor_enabled && (
                                            <div className="flex items-start gap-3">
                                                <XCircle className="mt-1 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        Two-Factor Authentication
                                                    </p>
                                                    <p className="text-base text-gray-900 dark:text-white">
                                                        Enabled
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <SheetFooter className="mt-auto gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSheetOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDecline}
                                >
                                    Decline
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleApprove}
                                >
                                    Approve
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                </div>
            </div>
        </AppLayout>
    );
}
