import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { Invitation } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface GuestsIndexProps {
  invitations: {
    data: (Invitation & {
      guests_count: number;
      confirmed_count: number;
      attended_count: number;
      pending_count: number;
    })[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  filters: {
    search?: string;
    sort?: string;
    direction?: string;
  };
}

export default function GuestsIndex({
  invitations,
  filters,
}: GuestsIndexProps) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/guests', { ...filters, search: search, page: 1 }, { preserveState: true });
  };



  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Guest Management', href: '/guests' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Guest Management" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Guest Management</h1>
            <p className="text-muted-foreground">
              Select an invitation to manage its guests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex-1 sm:flex-initial">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invitations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 sm:w-80"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Invitations Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invitations.data.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No invitations found</h3>
                  <p className="text-muted-foreground text-center">
                    Create an invitation first to manage guests
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/invitations/create">
                      Create Invitation
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            invitations.data.map((invitation) => (
              <Card key={invitation.invitation_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{invitation.wedding_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {invitation.groom_name} & {invitation.bride_name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Total Guests</p>
                      <p className="text-2xl font-bold text-blue-600">{invitation.guests_count}</p>
                    </div>
                    <div>
                      <p className="font-medium">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">{invitation.confirmed_count}</p>
                    </div>
                    <div>
                      <p className="font-medium">Attended</p>
                      <p className="text-2xl font-bold text-purple-600">{invitation.attended_count}</p>
                    </div>
                    <div>
                      <p className="font-medium">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">{invitation.pending_count}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Wedding Details</p>
                    <p className="text-sm text-muted-foreground">
                      📅 {new Date(invitation.wedding_date).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📍 {invitation.wedding_venue}
                    </p>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/guests/${invitation.invitation_id}`}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Guests
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {invitations.last_page > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => {
                      if (invitations.current_page > 1) {
                        router.get('/guests', { ...filters, page: invitations.current_page - 1 }, { preserveState: true });
                      }
                    }}
                    className={invitations.current_page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, invitations.last_page) }, (_, i) => {
                  let pageNumber;
                  if (invitations.last_page <= 5) {
                    pageNumber = i + 1;
                  } else if (invitations.current_page <= 3) {
                    pageNumber = i + 1;
                  } else if (invitations.current_page >= invitations.last_page - 2) {
                    pageNumber = invitations.last_page - 4 + i;
                  } else {
                    pageNumber = invitations.current_page - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => {
                          router.get('/guests', { ...filters, page: pageNumber }, { preserveState: true });
                        }}
                        isActive={pageNumber === invitations.current_page}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {invitations.last_page > 5 && invitations.current_page < invitations.last_page - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => {
                      if (invitations.current_page < invitations.last_page) {
                        router.get('/guests', { ...filters, page: invitations.current_page + 1 }, { preserveState: true });
                      }
                    }}
                    className={invitations.current_page >= invitations.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </AppLayout>
  );
}