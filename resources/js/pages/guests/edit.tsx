import { Head } from '@inertiajs/react';
import { Guest, Invitation, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import GuestForm from './_form';

interface GuestsEditProps {
  guest: Guest;
  invitation: Invitation;
  categories: Record<string, string>;
  attendanceStatuses: Record<string, string>;
  invitationStatuses: Record<string, string>;
}

export default function GuestsEdit({
  guest,
  invitation,
  categories,
  attendanceStatuses,
  invitationStatuses,
}: GuestsEditProps) {
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guest Management', href: '/guests' },
    { title: invitation.wedding_name, href: `/guests/${invitation.invitation_id}` },
    { title: `Edit ${guest.guest_name}`, href: '' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${guest.guest_name} - ${invitation.wedding_name}`} />
      <div className="flex flex-col flex-1 gap-4 p-4 h-full overflow-x-auto">
        <h1 className="font-semibold text-xl">Edit Guest: {guest.guest_name}</h1>
        <GuestForm
          action={`/guests/${invitation.invitation_id}/${guest.guest_id}`}
          method="put"
          submitLabel="Update Guest"
          cancelHref={`/guests/${invitation.invitation_id}`}
          invitation={invitation}
          guest={guest}
          categories={categories}
          attendanceStatuses={attendanceStatuses}
          invitationStatuses={invitationStatuses}
          isEdit={true}
        />
      </div>
    </AppLayout>
  );
}