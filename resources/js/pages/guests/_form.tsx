import { useState, useCallback } from 'react';
import { Guest, Invitation } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Form, Link } from '@inertiajs/react';

// Phone number normalization function (sama seperti di SKRIPSI)
const normalizePhoneNumber = (phoneNumber: string): string | null => {
  // Remove all non-numeric characters
  let phone = phoneNumber.replace(/[^0-9]/g, '');
  
  if (phone.length === 0) return null;
  
  // Handle different formats
  if (phone.startsWith('620')) {
    // 6208xxx -> 628xxx
    phone = '62' + phone.substring(3);
  } else if (phone.startsWith('62')) {
    // Already in 62xxx format - no change needed
  } else if (phone.startsWith('0')) {
    // 08xxx -> 628xxx
    phone = '62' + phone.substring(1);
  } else if (phone.startsWith('8')) {
    // 8xxx -> 628xxx
    phone = '62' + phone;
  } else {
    // Other formats, prepend 62
    phone = '62' + phone;
  }
  
  // Validate final format (should be 62 followed by 8-13 digits)
  if (!/^62[0-9]{8,13}$/.test(phone)) {
    return null; // Invalid format
  }
  
  return phone;
};

type Props = {
  action: string;
  method: 'post' | 'patch' | 'put';
  submitLabel?: string;
  cancelHref?: string;
  invitation: Invitation;
  guest?: Guest;
  categories: Record<string, string>;
  attendanceStatuses: Record<string, string>;
  invitationStatuses: Record<string, string>;
  isEdit?: boolean;
};

export default function GuestForm({
  action,
  method,
  submitLabel = 'Save',
  cancelHref = '/guests',
  guest,
  categories,
  attendanceStatuses,
  invitationStatuses,
  isEdit = false,
}: Props) {
  const [phonePreview, setPhonePreview] = useState(() => {
    if (isEdit && guest?.guest_contact) {
      const normalized = normalizePhoneNumber(guest.guest_contact);
      if (normalized) {
        return `Preview: ${normalized} (WhatsApp compatible)`;
      } else {
        return 'Invalid phone number format';
      }
    }
    return '';
  });
  const [phoneValid, setPhoneValid] = useState(() => {
    if (isEdit && guest?.guest_contact) {
      const normalized = normalizePhoneNumber(guest.guest_contact);
      return normalized !== null;
    }
    return true;
  });
  const [showCustomCategory, setShowCustomCategory] = useState(() => {
    if (isEdit && guest?.guest_category) {
      const categoryExists = Object.keys(categories).includes(guest.guest_category);
      return !categoryExists && guest.guest_category !== 'not_specified';
    }
    return false;
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (isEdit && guest?.guest_category) {
      const categoryExists = Object.keys(categories).includes(guest.guest_category);
      if (!categoryExists && guest.guest_category !== 'not_specified') {
        return 'custom';
      }
      return guest.guest_category;
    }
    return '';
  });



  const handlePhoneChange = useCallback((phoneNumber: string) => {
    if (phoneNumber.trim() === '') {
      setPhonePreview('');
      setPhoneValid(true);
      return;
    }

    const normalized = normalizePhoneNumber(phoneNumber);
    if (normalized) {
      setPhonePreview(`Preview: ${normalized} (WhatsApp compatible)`);
      setPhoneValid(true);
    } else {
      setPhonePreview('Invalid phone number format');
      setPhoneValid(false);
    }
  }, []);



  return (
    <Form method={method} action={action} options={{ preserveScroll: true }} className="max-w-2xl space-y-6">
      {({ processing, recentlySuccessful, errors }) => (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Guest Name */}
              <div className="grid gap-2">
                <Label htmlFor="guest_name">
                  Guest Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guest_name"
                  name="guest_name"
                  defaultValue={guest?.guest_name || ''}
                  placeholder="Enter guest name"
                  required
                />
                {errors.guest_name && (
                  <p className="text-sm text-red-500">{errors.guest_name}</p>
                )}
              </div>

              {/* Gender */}
              <div className="grid gap-2">
                <Label htmlFor="guest_gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="guest_gender"
                  defaultValue={guest?.guest_gender || ''}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.guest_gender && (
                  <p className="text-sm text-red-500">{errors.guest_gender}</p>
                )}
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="guest_category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <Select
                    name="guest_category"
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setShowCustomCategory(value === 'custom');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Not specified</SelectItem>
                      {Object.entries(categories).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Category...</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {showCustomCategory && (
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Enter custom category:</Label>
                      <Input
                        name="guest_category_custom"
                        placeholder="Enter custom category"
                        required
                      />
                    </div>
                  )}
                </div>
                {errors.guest_category && (
                  <p className="text-sm text-red-500">{errors.guest_category}</p>
                )}
              </div>

              {/* Contact */}
              <div className="grid gap-2">
                <Label htmlFor="guest_contact">
                  Contact (Phone Number) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guest_contact"
                  name="guest_contact"
                  defaultValue={guest?.guest_contact || ''}
                  placeholder="Enter phone number (e.g., 081234567890)"
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  required
                />
                {phonePreview && (
                  <Alert variant={phoneValid ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {phoneValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={phoneValid ? "text-green-600" : "text-red-600"}>
                        {phonePreview}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
                {errors.guest_contact && (
                  <p className="text-sm text-red-500">{errors.guest_contact}</p>
                )}
              </div>

              {/* Address */}
              <div className="grid gap-2">
                <Label htmlFor="guest_address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="guest_address"
                  name="guest_address"
                  defaultValue={guest?.guest_address || ''}
                  placeholder="Enter guest address"
                  className="h-24"
                  required
                />
                {errors.guest_address && (
                  <p className="text-sm text-red-500">{errors.guest_address}</p>
                )}
              </div>

              {/* Status fields only for edit mode */}
              {isEdit && (
                <>
                  {/* Attendance Status */}
                  <div className="grid gap-2">
                    <Label htmlFor="guest_attendance_status">Attendance Status</Label>
                    <Select
                      name="guest_attendance_status"
                      defaultValue={guest?.guest_attendance_status || '-'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select attendance status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(attendanceStatuses).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.guest_attendance_status && (
                      <p className="text-sm text-red-500">{errors.guest_attendance_status}</p>
                    )}
                  </div>

                  {/* Invitation Status */}
                  <div className="grid gap-2">
                    <Label htmlFor="guest_invitation_status">Invitation Status</Label>
                    <Select
                      name="guest_invitation_status"
                      defaultValue={guest?.guest_invitation_status || '-'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select invitation status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(invitationStatuses).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.guest_invitation_status && (
                      <p className="text-sm text-red-500">{errors.guest_invitation_status}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={processing}>
              {submitLabel}
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
            {recentlySuccessful && <p className="text-sm text-muted-foreground">Saved</p>}
          </div>
        </>
      )}
    </Form>
  );
}