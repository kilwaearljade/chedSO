import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical, Phone, Video, Send, Paperclip, Smile } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Message',
        href: dashboard().url,
    },
];

// Mock conversation data - replace with real data from props/API
const conversations = [
    {
        id: 1,
        name: 'John Doe',
        avatar: null,
        lastMessage: 'Hello! How can I help you?',
        timestamp: '2:30 PM',
        unread: 2,
        isActive: true,
    },
    {
        id: 2,
        name: 'Jane Smith',
        avatar: null,
        lastMessage: 'Thanks for the update!',
        timestamp: '1:15 PM',
        unread: 0,
        isActive: true,
    },
    {
        id: 3,
        name: 'Alice Johnson',
        avatar: null,
        lastMessage: 'See you tomorrow!',
        timestamp: '12:00 PM',
        unread: 0,
        isActive: false,
    },
];

const messages = [
    {
        id: 1,
        sender: 'other',
        text: 'Hello! How can I help you?',
        timestamp: '2:25 PM',
    },
    {
        id: 2,
        sender: 'me',
        text: 'I have a question about my appointment.',
        timestamp: '2:26 PM',
    },
    {
        id: 3,
        sender: 'other',
        text: 'Sure! What would you like to know?',
        timestamp: '2:27 PM',
    },
    {
        id: 4,
        sender: 'me',
        text: 'Can I reschedule it to next week?',
        timestamp: '2:28 PM',
    },
];

export default function Message() {
    const getInitials = useInitials();
    const [selectedConversation, setSelectedConversation] = useState(1);
    const [messageInput, setMessageInput] = useState('');

    const activeConversation = conversations.find(c => c.id === selectedConversation);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />
            <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex h-full w-full">

                    {/* LEFT SIDEBAR - Conversations List */}
                    <aside className="w-80 border-r border-border bg-card flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-border">
                            <h2 className="text-xl font-semibold text-foreground mb-3">Messages</h2>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search messages"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => setSelectedConversation(conversation.id)}
                                    className={`px-4 py-3 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                                        selectedConversation === conversation.id ? 'bg-muted/70' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar with active indicator */}
                                        <div className="relative">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={conversation.avatar || undefined} alt={conversation.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {getInitials(conversation.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {conversation.isActive && (
                                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500"></div>
                                            )}
                                        </div>

                                        {/* Conversation Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-foreground text-sm truncate">
                                                    {conversation.name}
                                                </h3>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                    {conversation.timestamp}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conversation.lastMessage}
                                                </p>
                                                {conversation.unread > 0 && (
                                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                                                        {conversation.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {conversations.length === 0 && (
                                <div className="p-5 text-sm text-muted-foreground text-center">
                                    No conversations found
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* RIGHT CHAT AREA */}
                    <section className="flex-1 flex flex-col bg-muted/30">
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={activeConversation.avatar || undefined} alt={activeConversation.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {getInitials(activeConversation.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {activeConversation.isActive && (
                                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{activeConversation.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {activeConversation.isActive ? 'Active now' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                            <Phone className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                            <Video className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex items-end gap-2 max-w-[70%] ${message.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {message.sender === 'other' && (
                                                    <Avatar className="h-6 w-6 mb-1">
                                                        <AvatarImage src={activeConversation.avatar || undefined} alt={activeConversation.name} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                            {getInitials(activeConversation.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className={`flex flex-col ${message.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                                    <div
                                                        className={`px-4 py-2 rounded-2xl ${
                                                            message.sender === 'me'
                                                                ? 'bg-[#0084FF] text-white rounded-br-md'
                                                                : 'bg-card text-foreground border border-border rounded-bl-md'
                                                        }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground mt-1 px-2">
                                                        {message.timestamp}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Message Input */}
                                <div className="border-t border-border bg-card px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                            <Paperclip className="h-5 w-5" />
                                        </button>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && messageInput.trim()) {
                                                        // Handle send message
                                                        setMessageInput('');
                                                    }
                                                }}
                                                className="w-full px-4 py-2.5 pr-10 rounded-full bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                <Smile className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (messageInput.trim()) {
                                                    // Handle send message
                                                    setMessageInput('');
                                                }
                                            }}
                                            className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!messageInput.trim()}
                                        >
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <p className="text-lg font-medium mb-2">Select a conversation</p>
                                    <p className="text-sm">Choose a conversation from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </AppLayout>
    );
}
