import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/utils/date';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAdminUsers } from '@/lib/hooks/admin/useAdminUsers';

export function AdminUserProfilesView() {
  const { data: users, isLoading, error } = useAdminUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (error) {
    toast.error('Failed to load users');
    return <div>Error loading users</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profiles</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="w-full h-12" />
                  </TableCell>
                </TableRow>
              ) : users?.map((user) => (
                <UserProfileRow 
                  key={user.id} 
                  userId={user.id}
                  onViewDetails={() => setSelectedUserId(user.id)}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {selectedUserId && (
        <UserProfileDialog
          userId={selectedUserId}
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </Card>
  );
}

function UserProfileRow({ userId, onViewDetails }: { userId: string; onViewDetails: () => void }) {
  const { data: profile, isLoading } = useUserProfile(userId);

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={6}>
          <Skeleton className="w-full h-8" />
        </TableCell>
      </TableRow>
    );
  }

  if (!profile) return null;

  return (
    <TableRow>
      <TableCell>{profile.name || 'N/A'}</TableCell>
      <TableCell>{profile.email}</TableCell>
      <TableCell>
        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
          {profile.role}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
          {profile.role || 'User'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={profile.email_notifications ? 'default' : 'destructive'}>
          {profile.email_notifications ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(profile.updated_at)}</TableCell>
      <TableCell>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
}

function UserProfileDialog({ 
  userId, 
  open, 
  onClose 
}: { 
  userId: string; 
  open: boolean; 
  onClose: () => void;
}) {
  const { data: profile, isLoading } = useUserProfile(userId);

  if (isLoading || !profile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Profile Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={profile.name || ''} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={profile.email} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Input value={profile.role} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Badge variant={profile.email_notifications ? 'default' : 'destructive'}>
              {profile.email_notifications ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="grid gap-2">
            <Label>Last Updated</Label>
            <Input value={formatDate(profile.updated_at)} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Email Preferences</Label>
            <Badge variant={profile.email_notifications ? 'default' : 'secondary'}>
              {profile.email_notifications ? 'Subscribed' : 'Unsubscribed'}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}