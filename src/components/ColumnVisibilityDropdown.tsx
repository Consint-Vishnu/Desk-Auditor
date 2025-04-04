
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye } from 'lucide-react';

interface Column {
  key: string;
  title: string;
}

interface ColumnVisibilityDropdownProps {
  columns: Column[];
  visibleColumns: Record<string, boolean>;
  setVisibleColumns: (columns: Record<string, boolean>) => void;
}

const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({
  columns,
  visibleColumns,
  setVisibleColumns,
}) => {
  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns({
      ...visibleColumns,
      [columnKey]: !visibleColumns[columnKey],
    });
  };

  const handleSelectAll = () => {
    const allVisible = Object.fromEntries(columns.map(col => [col.key, true]));
    setVisibleColumns(allVisible);
  };

  const handleDeselectAll = () => {
    // Keep at least 'claimNumber' visible
    const allHidden = Object.fromEntries(columns.map(col => [col.key, col.key === 'claimNumber']));
    setVisibleColumns(allHidden);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1 bg-gray-50 border-gray-200">
          <Eye size={14} />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-white border border-gray-200 rounded-md shadow-md">
        <DropdownMenuLabel className="text-xs font-semibold text-gray-700">Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />
        <div className="flex justify-between px-2 py-1">
          <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            Show All
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeselectAll} className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            Hide All
          </Button>
        </div>
        <DropdownMenuSeparator className="bg-gray-200" />
        <div className="max-h-[300px] overflow-y-auto">
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.key}
              checked={visibleColumns[column.key]}
              onCheckedChange={() => handleColumnToggle(column.key)}
              className="capitalize text-xs hover:bg-gray-50"
            >
              {column.title}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnVisibilityDropdown;
