import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    Users,
    Heart,
    Gift,
    MapPin,
    Clock,
    Calendar,
    Share2,
    QrCode,
    Plus,
    Download,
    Eye
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner'
import { useState } from 'react';

interface InvitationData {
    invitation_id: number;
    wedding_name: string;
    slug: string;
    groom_name: string;
    bride_name: string;
    groom_alias: string;
    bride_alias: string;
    wedding_date: string;
    wedding_time_start: string;
    wedding_time_end: string;
    wedding_venue: string;
    wedding_location: string;
    wedding_maps?: string;
    wedding_image?: string;
    created_at: string;
    guests: any[];
    wishes: any[];
    payments: any[];
}

interface InvitationShowProps {
    auth: {
        user: any;
    };
    flash?: {
        success?: string;
        error?: string;
        message?: string;
    };
    errors: Record<string, string>;
    invitation: InvitationData;
    stats: {
        total_guests: number;
        confirmed_guests: number;
        attended_guests: number;
        pending_guests: number;
        total_wishes: number;
        total_payments: number;
        pending_payments: number;
    };
}

export default function InvitationShow({ invitation, stats }: InvitationShowProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Invitations', href: '/invitations' },
        { title: invitation.wedding_name || 'Invitation', href: `/invitations/${invitation.invitation_id}` },
    ];

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/invitations/${invitation.invitation_id}`, {
            onSuccess: () => {
                toast.success('Invitation deleted successfully!');
            },
            onError: () => {
                toast.error('Failed to delete invitation.');
                setIsDeleting(false);
            },
        });
    };

    const invitationUrl = `${window.location.origin}/invitation/${invitation.slug}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(invitationUrl);
            toast.success('Invitation URL copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy URL');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={invitation.wedding_name} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Invitation Details</h1>
                            <p className="text-muted-foreground">
                                {invitation.groom_name} & {invitation.bride_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/invitations">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <Button variant="default" asChild>
                            <Link href={`/invitations/${invitation.invitation_id}/edit`}>
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={copyToClipboard}>
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the invitation for "{invitation.wedding_name}" and all associated data including guests, wishes, and payments.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-destructive hover:bg-destructive/30 hover:text-destructive-foreground"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Invitation'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <Users className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold">{stats.total_guests}</p>
                                <p className="text-sm text-muted-foreground">Total Guests</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <Heart className="h-8 w-8 text-pink-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold">{stats.total_wishes}</p>
                                <p className="text-sm text-muted-foreground">Wishes</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <Gift className="h-8 w-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold">
                                    Rp {(stats.total_payments || 0).toLocaleString('id-ID')}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Gifts</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                            <div>
                                <p className="text-2xl font-bold">{stats.attended_guests}</p>
                                <p className="text-sm text-muted-foreground">Attended</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {invitation.wedding_image && (
                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted mb-4">
                                        <img
                                            src={`/storage/${invitation.wedding_image}`}
                                            alt={invitation.wedding_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Date</span>
                                        </div>
                                        <p>{new Date(invitation.wedding_date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Time</span>
                                        </div>
                                        <p>
                                            {invitation.wedding_time_start.slice(0, 5)} - {invitation.wedding_time_end.slice(0, 5)} WIB
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Venue</span>
                                    </div>
                                    <p className="font-medium">{invitation.wedding_venue}</p>
                                    <p className="text-muted-foreground">{invitation.wedding_location}</p>
                                    {invitation.wedding_maps && (
                                        <a
                                            href={invitation.wedding_maps}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-primary hover:underline"
                                        >
                                            <MapPin className="h-4 w-4 mr-1" />
                                            View on Google Maps
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs */}
                        <Tabs defaultValue="guests" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="guests">Guests ({stats.total_guests})</TabsTrigger>
                                <TabsTrigger value="wishes">Wishes ({stats.total_wishes})</TabsTrigger>
                                <TabsTrigger value="payments">Payments ({invitation.payments.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="guests" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Guest List</h3>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                        <Button size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Guest
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {invitation.guests.slice(0, 5).map((guest: any) => (
                                        <Card key={guest.guest_id}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div>
                                                    <p className="font-medium">{guest.guest_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {guest.guest_category} • {guest.guest_contact}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            guest.guest_attendance_status === 'attended' ? 'default' :
                                                                guest.guest_attendance_status === 'confirmed' ? 'secondary' :
                                                                    'outline'
                                                        }
                                                    >
                                                        {guest.guest_attendance_status}
                                                    </Badge>
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {invitation.guests.length === 0 && (
                                        <Card>
                                            <CardContent className="text-center py-8">
                                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground mb-4">No guests added yet</p>
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Your First Guest
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {invitation.guests.length > 5 && (
                                        <Button variant="outline" className="w-full">
                                            View All {stats.total_guests} Guests
                                        </Button>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="wishes" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Wedding Wishes</h3>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {invitation.wishes.slice(0, 5).map((wish: any) => (
                                        <Card key={wish.wish_id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="mb-2">{wish.message}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            — {wish.guest?.guest_name || 'Anonymous'}
                                                        </p>
                                                    </div>
                                                    <Heart className="h-4 w-4 text-pink-500 ml-2 flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {invitation.wishes.length === 0 && (
                                        <Card>
                                            <CardContent className="text-center py-8">
                                                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground">No wishes received yet</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="payments" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Gift Payments</h3>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {invitation.payments.slice(0, 5).map((payment: any) => (
                                        <Card key={payment.payment_id}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div>
                                                    <p className="font-medium">{payment.guest?.guest_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {payment.order_id}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        Rp {payment.gross_amount.toLocaleString('id-ID')}
                                                    </p>
                                                    <Badge
                                                        variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}
                                                    >
                                                        {payment.payment_status}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {invitation.payments.length === 0 && (
                                        <Card>
                                            <CardContent className="text-center py-8">
                                                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                                <p className="text-muted-foreground">No payments received yet</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        {/* <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" variant="outline">
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Generate QR Code
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Send Invitations
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Data
                                </Button>
                            </CardContent>
                        </Card> */}

                        {/* Invitation URL */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" variant="outline">
                                    <QrCode className="h-4 w-4 mr-2" />
                                    QR Scanner
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href={`/guests/${invitation.invitation_id}`}>
                                        <Users className="h-4 w-4 mr-2" />
                                        Guests Management
                                    </Link>
                                </Button>
                                <CardTitle>Invitation URL</CardTitle>
                                <div className="p-3 bg-muted rounded-md">
                                    <p className="text-sm font-mono break-all">{invitationUrl}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={copyToClipboard} size="sm" className="flex-1">
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </Button>
                                    <Button
                                        onClick={() => window.open(invitationUrl, '_blank')}
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guest Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Guest Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Confirmed</span>
                                    <Badge>{stats.confirmed_guests}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Attended</span>
                                    <Badge variant="default">{stats.attended_guests}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Pending</span>
                                    <Badge variant="outline">{stats.pending_guests}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total</span>
                                    <Badge variant="secondary">{stats.total_guests}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
