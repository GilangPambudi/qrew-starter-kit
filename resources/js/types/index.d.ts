import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Invitations {
    id: number;
}

export interface Invitation {
    invitation_id: number;
    wedding_name: string;
    slug?: string;
    groom_name: string;
    bride_name: string;
    groom_alias: string;
    bride_alias: string;
    groom_image?: string | null;
    bride_image?: string | null;
    groom_child_number: number;
    bride_child_number: number;
    groom_father: string;
    groom_mother: string;
    bride_father: string;
    bride_mother: string;
    wedding_date: string;
    wedding_time_start: string;
    wedding_time_end: string;
    wedding_venue: string;
    wedding_location: string;
    wedding_maps?: string | null;
    wedding_image?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Guest {
    guest_id: number;
    guest_name: string;
    guest_id_qr_code?: string | null;
    guest_gender?: 'Male' | 'Female' | null;
    guest_category?: string | null;
    guest_contact?: string | null;
    guest_address?: string | null;
    guest_qr_code?: string | null;
    guest_attendance_status?: 'confirmed' | 'attended' | '-' | null;
    guest_invitation_status?: 'sent' | 'delivered' | 'opened' | '-' | null;
    guest_arrival_time?: string | null;
    user_id?: number | null;
    invitation_id: number;
    invitation_sent_at?: string | null;
    invitation_opened_at?: string | null;
    h4_reminder_sent_at?: string | null;
    h1_info_sent_at?: string | null;
    created_at?: string;
    updated_at?: string;
    invitation?: Invitation;
}