import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Guest } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ColumnDef, type Row } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<Guest>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'guest_name',
        header: ({ column }) => (
            <div onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex cursor-pointer items-center justify-between">
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        cell: ({ row }) => {
            const guest = row.original;
            return (
                <div className="font-semibold">{guest.guest_name}</div>
            );
        },
    },
    {
        accessorKey: 'guest_gender',
        header: ({ column }) => (
            <div onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex cursor-pointer items-center justify-between">
                Gender
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        cell: ({ row }) => {
            const gender = row.original.guest_gender;
            return gender ? <span>{gender}</span> : <span className="text-muted-foreground">-</span>;
        },
    },
    {
        accessorKey: 'guest_category',
        header: ({ column }) => (
            <div onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex cursor-pointer items-center justify-between">
                Category
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        cell: ({ row }) => {
            const category = row.original.guest_category;
            if (!category || category === 'not_specified') return <Badge variant="secondary">Not specified</Badge>;

            const variants: Record<string, string> = {
                'family': 'bg-purple-100 text-purple-800',
                'friend': 'bg-blue-100 text-blue-800',
                'colleague': 'bg-green-100 text-green-800',
                'vip': 'bg-yellow-100 text-yellow-800',
            };

            return (
                <Badge className={variants[category.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
                    {category}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'guest_contact',
        header: 'Contact',
        cell: ({ row }) => {
            const contact = row.original.guest_contact;
            return contact ? <span className="text-sm">{contact}</span> : <span className="text-sm text-muted-foreground">-</span>;
        },
        enableSorting: false,
    },
    {
        accessorKey: 'guest_address',
        header: 'Address',
        cell: ({ row }) => {
            const address = row.original.guest_address;
            return address ? (
                <div className="text-sm line-clamp-2 max-w-48">{address}</div>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: 'guest_invitation_status',
        header: ({ column }) => (
            <div onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex cursor-pointer items-center justify-between">
                Invitation Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        cell: ({ row }) => {
            const status = row.original.guest_invitation_status || '-';
            const variants = {
                'sent': 'bg-blue-100 text-blue-800',
                'delivered': 'bg-yellow-100 text-yellow-800',
                'opened': 'bg-green-100 text-green-800',
                '-': 'bg-gray-100 text-gray-800',
            };

            return (
                <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                    {status === 'sent' ? 'Sent' : status === 'delivered' ? 'Delivered' : status === 'opened' ? 'Opened' : 'Not Sent'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'guest_attendance_status',
        header: ({ column }) => (
            <div onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex cursor-pointer items-center justify-between">
                RSVP
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        cell: ({ row }) => {
            const status = row.original.guest_attendance_status || '-';
            const variants = {
                'confirmed': 'bg-blue-100 text-blue-800',
                'attended': 'bg-green-100 text-green-800',
                '-': 'bg-gray-100 text-gray-800',
            };

            return (
                <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
                    {status === 'confirmed' ? 'Confirmed' : status === 'attended' ? 'Attended' : 'Pending'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'guest_arrival_time',
        header: ({ column }) => (
            <div onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex cursor-pointer items-center justify-between">
                Arrival Time
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        cell: ({ row }) => {
            const arrivalTime = row.original.guest_arrival_time;
            if (!arrivalTime || arrivalTime === '-') {
                return <span className="text-sm text-muted-foreground">-</span>;
            }
            
            // Format waktu jika ada
            const formattedTime = new Date(arrivalTime).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
            
            return <span className="text-sm">{formattedTime}</span>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <GuestActionsCell row={row} />,
        enableSorting: false,
    },
];

function GuestActionsCell({ row }: { row: Row<Guest> }) {
    const guest = row.original;

    const handleCopyId = () => {
        if (guest.guest_id_qr_code) {
            navigator.clipboard.writeText(guest.guest_id_qr_code);
            toast.success('Guest ID copied to clipboard!');
        } else {
            toast.error('No Guest ID available to copy');
        }
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/guests/${guest.invitation_id}/${guest.guest_id}`, {
            onSuccess: () => {
                toast.success('Guest deleted successfully!');
            },
            onError: () => {
                toast.error('Failed to delete guest.');
                setIsDeleting(false);
            },
        });
    };

    return (
        <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="outline" onClick={handleCopyId} title="Copy Guest ID">
                <span className="text-xs">Copy ID</span>
            </Button>
            <Button asChild size="sm" variant="outline" title="Edit Guest">
                <Link href={`/guests/${guest.invitation_id}/${guest.guest_id}/edit`}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" title="Delete Guest">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the guest "{guest.guest_name}" and all associated data including QR code.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/30 hover:text-destructive-foreground"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Guest'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}