import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, UserPlus, Plus } from 'lucide-react';
import { Guest, Invitation } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { useIndexList } from '@/hooks/use-index-list';
import Heading from '@/components/heading';
import { toast } from 'sonner';
import { columns } from './columns';

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

interface GuestsShowProps {
    invitation: Invitation;
    guests: {
        data: Guest[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    stats: {
        total_guests: number;
        confirmed_guests: number;
        attended_guests: number;
        pending_guests: number;
    };
    filters: {
        q: string;
        per_page: number;
        sort: string;
        dir: string;
        guest_category?: string;
        attendance_status?: string;
        invitation_status?: string;
    };
    categories: Record<string, string>;
    attendanceStatuses: Record<string, string>;
    invitationStatuses: Record<string, string>;
}

export default function GuestsShow({
    invitation,
    guests,
    stats,
    filters,
    categories,
    attendanceStatuses,
    invitationStatuses,
}: GuestsShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [categoryFilter, setCategoryFilter] = useState<string>(filters?.guest_category || 'all');
    const [attendanceFilter, setAttendanceFilter] = useState<string>(filters?.attendance_status || 'all');
    const [invitationFilter, setInvitationFilter] = useState<string>(filters?.invitation_status || 'all');

    const { q, setQ, perPage, setPerPage, sorting, submit, onSortingChange, loading } = useIndexList(
        'guests', 
        invitation.invitation_id, 
        filters, 
        () => ({
            guest_category: categoryFilter !== 'all' ? categoryFilter : undefined,
            attendance_status: attendanceFilter !== 'all' ? attendanceFilter : undefined,
            invitation_status: invitationFilter !== 'all' ? invitationFilter : undefined,
        })
    );

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        submit(1);
    }, [categoryFilter, attendanceFilter, invitationFilter]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Guest Management', href: '/guests' },
        { title: invitation.wedding_name, href: `/guests/${invitation.invitation_id}` },
    ];

    const rightActions = (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex w-full flex-col gap-1 lg:w-56">
                <Select
                    value={categoryFilter}
                    onValueChange={(v) => {
                        setCategoryFilter(v);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(categories).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex w-full flex-col gap-1 lg:w-56">
                <Select
                    value={attendanceFilter}
                    onValueChange={(v) => {
                        setAttendanceFilter(v);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(attendanceStatuses).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex w-full flex-col gap-1 lg:w-56">
                <Select
                    value={invitationFilter}
                    onValueChange={(v) => {
                        setInvitationFilter(v);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(invitationStatuses).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Guests - ${invitation.wedding_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Heading 
                            title={invitation.wedding_name}
                            description={`${invitation.groom_name} & ${invitation.bride_name} - Guest List`}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild size="sm">
                            <Link href={`/invitations/${invitation.invitation_id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Invitation
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href={`/guests/${invitation.invitation_id}/create`}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Guest
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserPlus className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                                    <p className="text-2xl font-bold">{stats.total_guests}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <UserPlus className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                                    <p className="text-2xl font-bold">{stats.confirmed_guests}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <UserPlus className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Attended</p>
                                    <p className="text-2xl font-bold">{stats.attended_guests}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <UserPlus className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending_guests}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* DataTable */}
                <DataTable
                    columns={columns}
                    data={guests.data}
                    searchValue={q}
                    onSearchChange={setQ}
                    onSearchSubmit={() => submit(1)}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    page={guests.current_page}
                    pageCount={guests.last_page}
                    onPrev={() => submit(Math.max(1, guests.current_page - 1))}
                    onNext={() => submit(Math.min(guests.last_page, guests.current_page + 1))}
                    onPageChange={(p) => submit(p)}
                    canPrev={guests.current_page > 1}
                    canNext={guests.current_page < guests.last_page}
                    perPage={perPage}
                    onPerPageChange={(n) => {
                        setPerPage(n);
                        submit(1, { per_page: n });
                    }}
                    rightActions={rightActions}
                    loading={loading}
                />
            </div>
        </AppLayout>
    );
}