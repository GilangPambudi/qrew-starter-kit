import { Head } from '@inertiajs/react';
import { Invitation, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import GuestForm from './_form';

interface GuestsCreateProps {
  invitation: Invitation;
  categories: Record<string, string>;
  attendanceStatuses: Record<string, string>;
  invitationStatuses: Record<string, string>;
}

export default function GuestsCreate({
  invitation,
  categories,
  attendanceStatuses,
  invitationStatuses,
}: GuestsCreateProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guest Management', href: '/guests' },
    { title: invitation.wedding_name, href: `/guests/${invitation.invitation_id}` },
    { title: 'Add Guest', href: '' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Add Guest - ${invitation.wedding_name}`} />
      <div className="flex flex-col flex-1 gap-4 p-4 h-full overflow-x-auto">
        <h1 className="font-semibold text-xl">Add New Guest to {invitation.wedding_name}</h1>
        <GuestForm
          action={`/guests/${invitation.invitation_id}`}
          method="post"
          submitLabel="Add Guest"
          cancelHref={`/guests/${invitation.invitation_id}`}
          invitation={invitation}
          categories={categories}
          attendanceStatuses={attendanceStatuses}
          invitationStatuses={invitationStatuses}
        />
      </div>
    </AppLayout>
  );
}