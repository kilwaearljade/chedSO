import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Message',
        href: dashboard().url,
    },

];

export default function Message() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex h-screen w-full bg-dark text-gray-100 overflow-hidden">

                    {/* LEFT SIDEBAR */}
                    <aside className="w-80 bg-dark border-r border-gray-200 flex flex-col">

                        <div className="px-4 py-3 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Messages</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto">

                            {/* User Item */}
                            <div className="px-4 py-3 border-b hover:bg-gray-700 cursor-pointer">
                                John Doe
                            </div>

                            <div className="px-4 py-3 border-b hover:bg-gray-700 cursor-pointer">
                                Jane Smith
                            </div>

                            {/* Empty State */}
                            <div className="p-4 text-sm text-gray-400 text-center">
                                No registered users found
                            </div>

                        </div>
                    </aside>

                    {/* RIGHT CHAT AREA */}
                    <section className="flex-1 flex flex-col">

                        {/* HEADER */}
                        <div className="px-4 py-3 border-b">
                            <h3 className="font-semibold">John Doe</h3>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-2">

                            {/* Incoming Message */}
                            <div className="mb-2">
                                <span className="inline-block px-3 py-2 rounded bg-gray-700">
                                    Hello! How can I help you?
                                </span>
                            </div>

                            {/* Outgoing Message */}
                            <div className="mb-2 text-right">
                                <span className="inline-block px-3 py-2 rounded bg-blue-600">
                                    I have a question about my appointment.
                                </span>
                            </div>

                        </div>

                        {/* EMPTY STATE (optional placeholder) */}
                        <div className="flex-1 hidden items-center justify-center text-gray-400">
                            Select a conversation to start messaging
                        </div>

                        {/* INPUT */}
                        <div className="border-t px-4 py-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-white"
                                />
                                <button className="px-4 py-2 rounded-full bg-blue-600 text-white">
                                    Send
                                </button>
                            </div>
                        </div>

                    </section>

                </div>

            </div>
        </AppLayout>
    );
}
