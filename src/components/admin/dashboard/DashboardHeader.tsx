
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Select Date Range
        </Button>
        <Button size="sm">
          <DollarSign className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
