export interface User {
    id: number;
    name: string;
    profile_photo_path?: string;
}

export interface Appointment {
    id: number;
    school_name: string;
    appointment_date: string;
    file_count: number;
    daily_file_count?: number | null;
    is_split?: boolean;
    split_sequence?: number | null;
    total_splits?: number | null;
    status: 'pending' | 'complete' | 'cancelled';
    reason?: string;
    user?: User;
}

export interface AppointmentProps {
    appointments: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        search: string;
        status: string;
        date: string;
    };
}

export const statusConfig = {
    pending: {
        label: 'Pending',
        variant: 'outline' as const,
        className: 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
    },
    complete: {
        label: 'Complete',
        variant: 'outline' as const,
        className: 'border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'outline' as const,
        className: 'border-red-500/50 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    },
};
