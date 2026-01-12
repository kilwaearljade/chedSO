import AppLayout from '@/layouts/app-layout';
import { schooldashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical, Phone, Video, Send, Paperclip, Smile } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';
import { useState, useEffect, useRef, useCallback } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Message',
        href: schooldashboard().url,
    },
];

interface Conversation {
    id: number;
    name: string;
    avatar: string | null;
    lastMessage: string;
    timestamp: string;
    unread: number;
    isActive: boolean;
}

interface Message {
    id: number;
    sender: 'me' | 'other';
    text: string;
    timestamp: string;
}

interface MessagePageProps {
    conversations?: Conversation[];
}

export default function Message() {
    const getInitials = useInitials();
    const { props } = usePage<SharedData & MessagePageProps>();
    const initialConversations = props.conversations || [];
    
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const conversationsPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const activeConversation = conversations.find(c => c.id === selectedConversation);

    // Filter conversations based on search
    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fetch messages function
    const fetchMessages = (conversationId: number, isInitialLoad = false) => {
        if (isInitialLoad) {
            setLoading(true);
        }
        fetch(`/school/messages/${conversationId}/messages`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                setMessages(data.messages || []);
                if (isInitialLoad) {
                    setLoading(false);
                }
                // Mark as read
                fetch(`/school/messages/${conversationId}/read`, {
                    method: 'PATCH',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                });
            })
            .catch(() => {
                if (isInitialLoad) {
                    setLoading(false);
                }
            });
    };

    // Fetch conversations list
    const fetchConversations = useCallback(() => {
        router.reload({
            only: ['conversations'],
            preserveScroll: true,
            onSuccess: (page) => {
                const newProps = page.props as SharedData & MessagePageProps;
                if (newProps.conversations) {
                    setConversations(newProps.conversations);
                }
            },
        });
    }, []);

    // Fetch messages when conversation is selected
    useEffect(() => {
        // Clear previous polling interval
        if (messagesPollIntervalRef.current) {
            clearInterval(messagesPollIntervalRef.current);
            messagesPollIntervalRef.current = null;
        }

        if (selectedConversation) {
            // Initial load
            fetchMessages(selectedConversation, true);

            // Set up polling every 3 seconds
            messagesPollIntervalRef.current = setInterval(() => {
                // Only poll if page is visible
                if (!document.hidden) {
                    fetchMessages(selectedConversation, false);
                }
            }, 3000);
        } else {
            setMessages([]);
        }

        // Cleanup
        return () => {
            if (messagesPollIntervalRef.current) {
                clearInterval(messagesPollIntervalRef.current);
                messagesPollIntervalRef.current = null;
            }
        };
    }, [selectedConversation]);

    // Poll conversations list every 5 seconds
    useEffect(() => {
        conversationsPollIntervalRef.current = setInterval(() => {
            // Only poll if page is visible
            if (!document.hidden) {
                fetchConversations();
            }
        }, 5000);

        // Cleanup
        return () => {
            if (conversationsPollIntervalRef.current) {
                clearInterval(conversationsPollIntervalRef.current);
                conversationsPollIntervalRef.current = null;
            }
        };
    }, []);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedConversation || sending) {
            return;
        }

        const messageText = messageInput.trim();
        setMessageInput('');
        setSending(true);

        // Get CSRF token from cookie
        const getCsrfToken = () => {
            const name = 'XSRF-TOKEN';
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return '';
        };

        fetch('/school/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()),
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                receiver_id: selectedConversation,
                message: messageText,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.message) {
                    setMessages(prev => [...prev, data.message]);
                    // Refresh conversations to update last message
                    fetchConversations();
                    // Auto-scroll to bottom when user sends a message
                    setTimeout(() => {
                        if (messagesEndRef.current) {
                            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                }
                setSending(false);
            })
            .catch(() => {
                setMessageInput(messageText); // Restore message on error
                setSending(false);
            });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.map((conversation) => (
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
                                                    {conversation.lastMessage || 'No messages yet'}
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

                            {filteredConversations.length === 0 && (
                                <div className="p-5 text-sm text-muted-foreground text-center">
                                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
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
                                <div 
                                    ref={messagesContainerRef}
                                    className="flex-1 p-4 overflow-y-auto space-y-3"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-muted-foreground">Loading messages...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((message) => (
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
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
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
                                                onKeyPress={handleKeyPress}
                                                disabled={sending}
                                                className="w-full px-4 py-2.5 pr-10 rounded-full bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                            />
                                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                                <Smile className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleSendMessage}
                                            className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!messageInput.trim() || sending}
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
