import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  createColumnHelper,
  ColumnFiltersState,
  FilterFn
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HandoutsTable } from "@/components/handouts/DCAmemberTable";
import { Search } from "lucide-react";

const handoutStatuses = ["pending", "approved", "rejected", "notsubmitted"];

interface Handout {
  id: string;
  courseName: string;
  courseCode: string;
  professorName?: string;
  submittedOn: string;
  date: string; // Added date attribute
  status: string;
  category: "HD" | "FD";
  semester: string;
}

// dummy data temporailiy 
const dummyHandouts: Handout[] = [
  {
    id: "1",
    courseName: "Introduction to Computer Science",
    courseCode: "CS101",
    professorName: "Dr. Smith",
    submittedOn: "2025-03-15",
    date: "2025-03-16", // Added date value
    status: "pending",
    category: "HD",
    semester: "2nd Semester, 2024-25"
  },
  {
    id: "2",
    courseName: "Data Structures and Algorithms",
    courseCode: "CS201",
    professorName: "Dr. Johnson",
    submittedOn: "2025-03-20",
    date: "2025-03-21", // Added date value
    status: "approved",
    category: "FD",
    semester: "2nd Semester, 2024-25"
  },
  {
    id: "3",
    courseName: "Database Management Systems",
    courseCode: "CS301",
    professorName: "Dr. Williams",
    submittedOn: "2025-03-10",
    date: "2025-03-11", // Added date value
    status: "rejected",
    category: "HD",
    semester: "2nd Semester, 2024-25"
  },
  {
    id: "4",
    courseName: "Operating Systems",
    courseCode: "CS302",
    professorName: "Dr. Brown",
    submittedOn: "2025-03-05",
    date: "2025-03-06", // Added date value
    status: "notsubmitted",
    category: "HD",
    semester: "2nd Semester, 2024-25"
  },
  {
    id: "5",
    courseName: "Computer Networks",
    courseCode: "CS401",
    professorName: "Dr. Davis",
    submittedOn: "2025-03-25",
    date: "2025-03-26", // Added date value
    status: "pending",
    category: "FD",
    semester: "2nd Semester, 2024-25"
  }
];

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  approved: "text-green-600 bg-green-50 border-green-200",
  revision: "text-red-600 bg-red-50 border-red-200",
  notsubmitted: "text-red-500 bg-gray-50 border-gray-200",
};

const arrayIncludesSome: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return filterValue.includes(value);
};

const DCAMemberHandouts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  const columnHelper = createColumnHelper<Handout>();
  
  const columns = useMemo(
    () => [
      columnHelper.accessor("courseCode", {
        header: "Code",
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("courseName", {
        header: "Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("category", {
        header: "FD/HD",
        cell: (info) => info.getValue(),
        filterFn: arrayIncludesSome,
      }),
      columnHelper.accessor("professorName", {
        header: "Instructor",
        cell: (info) => info.getValue() || "Unassigned",
      }),
      columnHelper.accessor("professorName", {
        id: "reviewer",
        header: "Reviewer",
        cell: (info) => info.getValue() || "Unassigned",
      }),
      
      columnHelper.accessor("date", { // Added date column before status
        header: "Date",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Current Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium uppercase 
            ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>
              {status}
            </span>
          );
        },
        filterFn: arrayIncludesSome,
      }),
      {
        id: "actions",
        header: "Review",
        cell: ({ row }: { row: any }) => {
          const handout = row.original;
          return (handout.status === "pending" || handout.status === "notsubmitted") ? (
            <Button
              asChild
              variant="outline"
              className="whitespace-nowrap hover:bg-primary hover:text-white border-gray-300"
            >
              <Link to={`/handout/dca/review/${handout.id}`}>
                Review
              </Link> 
            </Button>
          ) : (
            <span className="text-gray-400 text-sm">None</span>
          );
        },
      },
    ],
    []
  );

  const handleFilterChange = (selectedValues: string[]) => {
    const updatedFilters = [...columnFilters];
    
    const typeFilterIndex = updatedFilters.findIndex(filter => filter.id === 'category');
    const statusFilterIndex = updatedFilters.findIndex(filter => filter.id === 'status');
    
    const categoryValues = ["HD", "FD"];
    const selectedTypeFilters = selectedValues.filter(val => categoryValues.includes(val));
    const selectedStatusFilters = selectedValues.filter(val => !categoryValues.includes(val));
    
    if (typeFilterIndex >= 0) {
      if (selectedTypeFilters.length > 0) {
        updatedFilters[typeFilterIndex] = { id: 'category', value: selectedTypeFilters };
      } else {
        updatedFilters.splice(typeFilterIndex, 1);
      }
    } else if (selectedTypeFilters.length > 0) {
      updatedFilters.push({ id: 'category', value: selectedTypeFilters });
    }
    
    if (statusFilterIndex >= 0) {
      if (selectedStatusFilters.length > 0) {
        updatedFilters[statusFilterIndex] = { id: 'status', value: selectedStatusFilters };
      } else {
        updatedFilters.splice(statusFilterIndex > typeFilterIndex && typeFilterIndex !== -1 ? 
          statusFilterIndex - 1 : statusFilterIndex, 1);
      }
    } else if (selectedStatusFilters.length > 0) {
      updatedFilters.push({ id: 'status', value: selectedStatusFilters });
    }
    
    setColumnFilters(updatedFilters);
  };

  const getActiveFilters = (): string[] => {
    const typeFilter = columnFilters.find(filter => filter.id === 'category');
    const statusFilter = columnFilters.find(filter => filter.id === 'status');
    
    const typeValues = typeFilter ? (typeFilter.value as string[]) : [];
    const statusValues = statusFilter ? (statusFilter.value as string[]) : [];
    
    return [...typeValues, ...statusValues];
  };

  const table = useReactTable({
    data: dummyHandouts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      globalFilter: searchQuery,
      columnFilters,
    },
    onGlobalFilterChange: setSearchQuery,
    filterFns: {
      arrayIncludesSome,
    },
  });

  return (
    <div className="h-screen w-full bg-white text-gray-800">
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Handouts - DCA Member
                </h1>
                <p className="text-sm text-gray-600">
                  2nd Semester, 2024-25
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="SEARCH"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 bg-white border-gray-300 text-gray-800"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="flex-grow flex justify-end">
                <ToggleGroup
                  type="multiple"
                  value={getActiveFilters()}
                  onValueChange={handleFilterChange}
                  className="flex flex-wrap gap-2 bg-transparent"
                >
                  <ToggleGroupItem
                    value="FD"
                    className="border border-gray-300 text-sm bg-white data-[state=on]:bg-gray-100"
                  >
                    FD
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="HD"
                    className="border border-gray-300 text-sm bg-white data-[state=on]:bg-gray-100"
                  >
                    HD
                  </ToggleGroupItem>
                  {handoutStatuses.map((status) => (
                    <ToggleGroupItem
                      key={status}
                      value={status}
                      className="border border-gray-300 capitalize text-xs md:text-sm bg-white data-[state=on]:bg-gray-100"
                    >
                      {status}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-grow overflow-auto p-4 md:p-6">
          <HandoutsTable table={table} />
        </div>
      </div>
    </div>
  );
};

export default DCAMemberHandouts;
