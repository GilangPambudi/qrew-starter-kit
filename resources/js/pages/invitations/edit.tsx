import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InvitationForm from './_form';
import type { Invitation, BreadcrumbItem } from '@/types';

export default function EditInvitation({ invitation }: { invitation: Invitation }) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invitations', href: '/invitations' },
    { title: invitation.wedding_name || 'Invitation', href: `/invitations/${invitation.invitation_id}` },
    { title: 'Edit', href: `/invitations/${invitation.invitation_id}/edit` },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Invitation - ${invitation.wedding_name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Edit Wedding Invitation</h1>
            <p className="text-muted-foreground">Update your wedding invitation details</p>
          </div>
        </div>
        <InvitationForm 
          action={`/invitations/${invitation.invitation_id}`} 
          method="patch" 
          submitLabel="Update" 
          initial={invitation} 
        />
      </div>
    </AppLayout>
  )
}
