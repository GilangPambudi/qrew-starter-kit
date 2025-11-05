import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InvitationForm from './_form';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Invitations', href: '/invitations' },
  { title: 'Create', href: '/invitations/create' },
]

export default function CreateInvitation() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Invitation" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Create Wedding Invitation</h1>
            <p className="text-muted-foreground">Create a new wedding invitation and start managing your guests</p>
          </div>
        </div>
        <InvitationForm action="/invitations" method="post" submitLabel="Save" />
      </div>
    </AppLayout>
  )
}
