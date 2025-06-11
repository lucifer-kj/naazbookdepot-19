import React, { useState } from 'react';
import { useAdminAllUsers, PublicUser } from '@/lib/hooks/useAdminUsers'; // Adjusted import path
import { Loader2, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Customers: React.FC = () => {
  const { data: customers, isLoading, error } = useAdminAllUsers();
  const [searchTerm, setSearchTerm] = useState('');

  // Client-side search (can be replaced with server-side later)
  const filteredCustomers = customers?.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-naaz-green" />
        <p className="ml-2 text-lg">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    toast.error(`Error fetching customers: ${error.message}`);
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Fetching Customers</h2>
        <p className="text-center max-w-md">{error.message || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green mb-6">Manage Customers</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-96 focus:ring-2 focus:ring-naaz-green focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Add New Customer button can be added here later */}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100">
                <TableHead className="py-3 px-4 font-semibold text-gray-600">Name</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-gray-600">Email</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-gray-600">Phone</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-gray-600">Orders</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-gray-600">Joined</TableHead>
                <TableHead className="py-3 px-4 font-semibold text-gray-600 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer: PublicUser) => (
                  <TableRow key={customer.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <TableCell className="py-3 px-4 text-sm text-gray-700">{customer.full_name || 'N/A'}</TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-700">{customer.email}</TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-700">{customer.phone || 'N/A'}</TableCell>
                    <TableCell className="py-3 px-4 text-sm text-gray-700">N/A</TableCell> {/* Placeholder for orders count */}
                    <TableCell className="py-3 px-4 text-sm text-gray-700">
                      {customer.created_at ? format(new Date(customer.created_at), 'dd MMM yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 mr-2"
                        onClick={() => console.log('View customer', customer.id)} // Stub
                        disabled // Stub
                      >
                        <Eye className="h-4 w-4 mr-1 md:mr-2" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructiveOutline"
                        className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => console.log('Delete customer', customer.id)} // Stub
                        disabled // Stub
                      >
                        <Trash2 className="h-4 w-4 mr-1 md:mr-2" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    <p className="text-lg">No customers found.</p>
                    {searchTerm && <p>Try adjusting your search term or clear the search.</p>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
