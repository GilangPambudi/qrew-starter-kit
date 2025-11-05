import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Calendar, 
    Plus, 
    Search, 
    Edit, 
    Eye, 
    Trash2, 
    Copy,
    Users,
    Heart,
    Gift,
    MapPin,
    Clock,
    Filter,
    Download
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

interface InvitationData {
    invitation_id: number;
    wedding_name: string;
    slug: string;
    groom_name: string;
    bride_name: string;
    wedding_date: string;
    wedding_time_start: string;
    wedding_time_end: string;
    wedding_venue: string;
    wedding_location: string;
    wedding_image?: string;
    guests_count: number;
    confirmed_count: number;
    attended_count: number;
    pending_count: number;
    total_wishes: number;
    total_payments: number;
    created_at: string;
}

interface InvitationsIndexProps {
    auth: {
        user: any;
    };
    flash?: {
        success?: string;
        error?: string;
        message?: string;
    };
    errors: Record<string, string>;
    invitations: {
        data: InvitationData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invitations', href: '/invitations' },
];

export default function InvitationsIndex({ invitations, filters }: InvitationsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/invitations', { search }, {
            preserveState: true,
            replace: true,
        });
    };
    
    const handleSort = (column: string) => {
        const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/invitations', { ...filters, sort: column, direction }, {
            preserveState: true,
            replace: true,
        });
    };
    
    const handleDelete = (invitation: InvitationData) => {
        if (confirm(`Are you sure you want to delete "${invitation.wedding_name}"?`)) {
            router.delete(`/invitations/${invitation.invitation_id}`);
        }
    };
    
    const handleDuplicate = (invitation: InvitationData) => {
        router.post(`/invitations/${invitation.invitation_id}/duplicate`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invitations" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Wedding Invitations</h1>
                        <p className="text-muted-foreground">
                            Manage your wedding invitations and track guest responses
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <form onSubmit={handleSearch} className="flex-1 sm:flex-initial">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search invitations..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 sm:w-80"
                                />
                            </div>
                        </form>
                        <Link href="/invitations/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Invitation
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Invitations Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {invitations.data.map((invitation) => (
                        <Card
                            key={invitation.invitation_id}
                            className="group hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.get(`/invitations/${invitation.invitation_id}`)}
                        >
                            <CardHeader className="relative">
                                {invitation.wedding_image && (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted mb-4">
                                        <img 
                                            src={`/storage/${invitation.wedding_image}`}
                                            alt={invitation.wedding_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                <div
                                    className="absolute top-4 right-4"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="sr-only">Actions</span>
                                                ⋯
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/invitations/${invitation.invitation_id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/invitations/${invitation.invitation_id}/edit`}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDuplicate(invitation)}>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDelete(invitation)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                
                                <CardTitle className="text-lg">{invitation.wedding_name}</CardTitle>
                                <CardDescription>
                                    {invitation.groom_name} & {invitation.bride_name}
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {/* Event Details */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{new Date(invitation.wedding_date).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{invitation.wedding_time_start} - {invitation.wedding_time_end}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{invitation.wedding_venue}</span>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="grid grid-cols-3 gap-4 py-3 border-t">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span className="font-semibold">{invitation.guests_count}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">Guests</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Heart className="h-4 w-4 text-pink-600" />
                                            <span className="font-semibold">{invitation.total_wishes}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">Wishes</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Gift className="h-4 w-4 text-green-600" />
                                            <span className="font-semibold">
                                                {invitation.total_payments > 0 ? 'Rp' + (invitation.total_payments / 1000) + 'K' : '0'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">Gifts</span>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex gap-2 flex-wrap">
                                    {invitation.confirmed_count > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {invitation.confirmed_count} Confirmed
                                        </Badge>
                                    )}
                                    {invitation.attended_count > 0 && (
                                        <Badge variant="default" className="text-xs bg-green-600">
                                            {invitation.attended_count} Attended
                                        </Badge>
                                    )}
                                    {invitation.pending_count > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {invitation.pending_count} Pending
                                        </Badge>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
                                    <Button asChild variant="default" size="sm" className="flex-1">
                                        <Link href={`/invitations/${invitation.invitation_id}`}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                        <Link href={`/invitations/${invitation.invitation_id}/edit`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {invitations.data.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No invitations found</h3>
                            <p className="text-muted-foreground mb-4">
                                {filters.search ? 'No invitations match your search.' : 'Get started by creating your first wedding invitation.'}
                            </p>
                            {!filters.search && (
                                <Link href="/invitations/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Invitation
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {invitations.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {invitations.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
