
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, Search, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getUsers } from '@/lib/api/admin-service';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  role: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const { users, totalCount } = await getUsers(page, 10, searchTerm);
        setCustomers(users);
        setTotalCount(totalCount);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load customers. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [page, searchTerm, toast]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // The actual search is triggered by the useEffect due to the searchTerm dependency
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="relative max-w-sm mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          
          <Table>
            <TableCaption>
              {totalCount > 0 ? (
                <div className="flex items-center justify-between py-4">
                  <div>
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} customers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div>No customers found</div>
              )}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{formatDate(customer.created_at)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        customer.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
