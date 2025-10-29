import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tag, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import PromoCodeModal from '@/components/admin/PromoCodeModal';

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  start_date: Date;
  end_date: Date | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
}

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        // await deletePromoCode(id);
        setPromoCodes(promoCodes.filter(code => code.id !== id));
      } catch (error) {
        import('../../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
          handleDatabaseError(error, 'delete_promo_code', { promoCodeId: id });
        });
      }
    }
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: Partial<PromoCode>) => {
    try {
      if (editingCode) {
        // await updatePromoCode(editingCode.id, formData);
        setPromoCodes(promoCodes.map(code => 
          code.id === editingCode.id ? { ...code, ...formData } : code
        ));
      } else {
        // const newCode = await createPromoCode(formData);
        // setPromoCodes([...promoCodes, newCode]);
      }
      setIsModalOpen(false);
      setEditingCode(null);
    } catch (error) {
      import('../../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
        handleDatabaseError(error, 'save_promo_code', { promoCode: editingCode });
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Promo Codes
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage promotional codes and discounts.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Add Promo Code
          </Button>
        </div>

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map(code => (
                <TableRow key={code.id}>
                  <TableCell className="font-medium uppercase">
                    {code.code}
                  </TableCell>
                  <TableCell>{code.description}</TableCell>
                  <TableCell>
                    {code.discount_type === 'percentage' 
                      ? `${code.discount_amount}%`
                      : `₹${code.discount_amount}`}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {format(code.start_date, 'PP')}</div>
                      {code.end_date && (
                        <div>To: {format(code.end_date, 'PP')}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {code.current_uses}
                    {code.max_uses && ` / ${code.max_uses}`}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={code.is_active ? 'default' : 'secondary'}
                    >
                      {code.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(code)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(code.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {promoCodes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No promo codes found</p>
                    <p className="text-sm text-gray-400">
                      Create your first promo code to get started
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isModalOpen && (
        <PromoCodeModal
          promoCode={editingCode}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCode(null);
          }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}