import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

interface PromoCodeModalProps {
  promoCode?: PromoCode | null;
  onClose: () => void;
  onSave: (data: Partial<PromoCode>) => void;
}

export default function PromoCodeModal({ promoCode, onClose, onSave }: PromoCodeModalProps) {
  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: promoCode?.code || '',
    description: promoCode?.description || '',
    discount_amount: promoCode?.discount_amount || 0,
    discount_type: promoCode?.discount_type || 'percentage',
    start_date: promoCode?.start_date || new Date(),
    end_date: promoCode?.end_date || null,
    max_uses: promoCode?.max_uses || null,
    is_active: promoCode?.is_active ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Promo code is required';
    } else if (!/^[A-Z0-9-_]+$/.test(formData.code)) {
      newErrors.code = 'Only uppercase letters, numbers, hyphens and underscores allowed';
    }

    if (!formData.discount_amount || formData.discount_amount <= 0) {
      newErrors.discount_amount = 'Discount amount must be greater than 0';
    }

    if (formData.discount_type === 'percentage' && formData.discount_amount > 100) {
      newErrors.discount_amount = 'Percentage discount cannot exceed 100%';
    }

    if (formData.max_uses !== null && formData.max_uses < 0) {
      newErrors.max_uses = 'Maximum uses cannot be negative';
    }

    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      onSave(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {promoCode ? 'Edit' : 'Create'} Promo Code
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER2024"
              maxLength={20}
            />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summer sale discount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: 'percentage' | 'fixed') => 
                  setFormData({ ...formData, discount_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_amount">Amount</Label>
              <Input
                id="discount_amount"
                type="number"
                min="0"
                step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                value={formData.discount_amount}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  discount_amount: parseFloat(e.target.value) 
                })}
              />
              {errors.discount_amount && (
                <p className="text-sm text-red-600">{errors.discount_amount}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {formData.start_date ? (
                      format(formData.start_date, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => 
                      setFormData({ ...formData, start_date: date || new Date() })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {formData.end_date ? (
                      format(formData.end_date, 'PPP')
                    ) : (
                      <span>No end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date || undefined}
                    onSelect={(date) => 
                      setFormData({ ...formData, end_date: date })
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.end_date && (
                <p className="text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_uses">Maximum Uses</Label>
            <Input
              id="max_uses"
              type="number"
              min="0"
              value={formData.max_uses === null ? '' : formData.max_uses}
              onChange={(e) => setFormData({
                ...formData,
                max_uses: e.target.value === '' ? null : parseInt(e.target.value)
              })}
              placeholder="Unlimited"
            />
            {errors.max_uses && (
              <p className="text-sm text-red-600">{errors.max_uses}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {promoCode ? 'Update' : 'Create'} Promo Code
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}