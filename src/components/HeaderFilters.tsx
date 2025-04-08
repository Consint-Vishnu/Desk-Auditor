import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, SlidersHorizontal } from 'lucide-react';

interface HeaderFiltersProps {
  onFilter: (filters: any) => void;
  onExport: () => void;
  onAdvancedFilter?: () => void;
  defaultFilters?: {
    startDate?: string;
    endDate?: string;
    triggerType?: string;
  };
}

const HeaderFilters: React.FC<HeaderFiltersProps> = ({ 
  onFilter, 
  onExport,
  onAdvancedFilter,
  defaultFilters = {}
}) => {
  const [startDate, setStartDate] = useState<string>(defaultFilters.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(defaultFilters.endDate || format(new Date(), 'yyyy-MM-dd'));
  const [triggerType, setTriggerType] = useState<string>(defaultFilters.triggerType || 'Ai');
  
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    if (defaultFilters.startDate) {
      setStartDate(defaultFilters.startDate);
    }
    if (defaultFilters.endDate) {
      setEndDate(defaultFilters.endDate);
    }
    if (defaultFilters.triggerType) {
      setTriggerType(defaultFilters.triggerType);
    }
  }, [defaultFilters]);

  const handleApplyFilter = () => {
    onFilter({
      startDate,
      endDate,
      triggerType
    });
  };
  
  // Parse string date to Date object
  const parseDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-wrap items-end gap-2 flex-1">
        <div className="flex flex-col space-y-1 min-w-[150px]">
          <Label htmlFor="start_date" className="text-xs">Start Date</Label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-9 px-3 py-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={parseDate(startDate)}
                onSelect={(date) => {
                  if (date) {
                    setStartDate(format(date, 'yyyy-MM-dd'));
                    setStartDateOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex flex-col space-y-1 min-w-[150px]">
          <Label htmlFor="end_date" className="text-xs">End Date</Label>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-9 px-3 py-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={parseDate(endDate)}
                onSelect={(date) => {
                  if (date) {
                    setEndDate(format(date, 'yyyy-MM-dd'));
                    setEndDateOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex flex-col space-y-1 min-w-[120px]">
          <Label htmlFor="trigger_type" className="text-xs">Trigger Type</Label>
          <Select value={triggerType} onValueChange={setTriggerType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Trigger Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ai">AI</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="All">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white h-9"
          onClick={handleApplyFilter}
        >
          Apply Filter
        </Button>
        
        {onAdvancedFilter && (
          <Button 
            variant="outline" 
            size="sm" 
            className="border-blue-200 text-blue-600 hover:bg-blue-50 h-9"
            onClick={onAdvancedFilter}
          >
            <SlidersHorizontal className="w-4 h-4 mr-1" /> More Filters
          </Button>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="border-blue-200 text-blue-600 hover:bg-blue-50 h-9"
        onClick={onExport}
      >
        <Download className="w-4 h-4 mr-1" /> Export
      </Button>
    </div>
  );
};

export default HeaderFilters;