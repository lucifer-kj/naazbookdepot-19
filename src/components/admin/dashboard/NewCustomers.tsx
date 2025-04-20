
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface NewCustomersProps {
  customers: Customer[];
}

const NewCustomers = ({ customers }: NewCustomersProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>New Customers</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin/customers">
              View All
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {customers.length > 0 ? (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-naaz-green text-white">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {formatDate(customer.created_at)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 text-center text-muted-foreground">
            <p>No new customers recently</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewCustomers;
