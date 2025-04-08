import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/handouts/filterBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_COLORS } from "@/components/handouts/types";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { toast } from "sonner";
export interface DCAHandout {
  id: string;
  courseName: string;
  courseCode: string;
  category: string;
  professorName: string;
  submittedOn: string;
  lecturewisePlanLearningObjective: boolean | null;
  status: string;
}

export const DCAMemberHandouts: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: handouts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["handouts-dca"],
    queryFn: async () => {
      try {
        const response = await api.get<{
          handouts: DCAHandout[];
          success: boolean;
        }>("/handout/dca/get");
        if (response.data.handouts) {
          setFilteredHandouts(response.data.handouts);
          localStorage.setItem(
            "handouts DCA MEMBER",
            JSON.stringify(response.data.handouts)
          );
        }
        return response.data.handouts;
      } catch (error) {
        toast.error("Failed to fetch handouts");
        throw error;
      }
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>(
    []
  );
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
  const [filteredHandouts, setFilteredHandouts] = useState<DCAHandout[]>();

  useEffect(() => {
    let results = handouts;

    if (searchQuery) {
      results = results?.filter(
        (handout) =>
          handout.courseName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          handout.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    results = results?.filter((handout) => {
      const matchesCategory =
        activeCategoryFilters.length > 0
          ? activeCategoryFilters.includes(handout.category)
          : true;
      const matchesStatus =
        activeStatusFilters.length > 0
          ? activeStatusFilters.includes(handout.status)
          : true;
      return matchesCategory && matchesStatus;
    });

    setFilteredHandouts(results);
  }, [searchQuery, activeCategoryFilters, activeStatusFilters, handouts]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (isError)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error fetching handouts
      </div>
    );

  return (
    <div className="w-full px-4">
      <div className="px-2 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              DCA Member - Handouts
            </h1>
            <p className="mt-2 text-gray-600">2nd semester 2024-25</p>
          </div>
          <div className="ml-4">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeCategoryFilters={activeCategoryFilters}
              onCategoryFilterChange={setActiveCategoryFilters}
              activeStatusFilters={activeStatusFilters}
              onStatusFilterChange={setActiveStatusFilters}
            />
          </div>
        </div>
      </div>

      <hr className="my-1 border-gray-300" />

      <div className="w-full overflow-x-auto bg-white shadow">
        <div className="inline-block min-w-full align-middle">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="px-4 py-2 text-left">
                  Course Code
                </TableHead>
                <TableHead className="px-4 py-2 text-left">
                  Course Name
                </TableHead>
                <TableHead className="px-4 py-2 text-left">Category</TableHead>
                <TableHead className="px-4 py-2 text-left">IC Name</TableHead>
                <TableHead className="px-4 py-2 text-left">Status</TableHead>
                <TableHead className="px-4 py-2 text-left">
                  Submitted On
                </TableHead>
                <TableHead className="px-4 py-2 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-300">
              {filteredHandouts?.length ? (
                filteredHandouts.map((handout) => (
                  <TableRow
                    key={handout.id}
                    className="odd:bg-white even:bg-gray-100"
                  >
                    <TableCell className="px-4 py-2">
                      {handout.courseCode}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      {handout.courseName}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      {handout.category}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      {handout.professorName}
                    </TableCell>
                    <TableCell className="px-4 py-2 uppercase">
                      <span className={STATUS_COLORS[handout.status]}>
                        {handout.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      {new Date(handout.submittedOn).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      {handout.status == "notsubmitted" ? (
                        <Button
                          disabled
                          className="cursor-not-allowed bg-white text-gray-500 opacity-50"
                        >
                          None
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="hover:bg-primary hover:text-white"
                          onClick={() =>
                            navigate(`/handout/dca/review/${handout.id}`)
                          }
                        >
                          {handout.status == "pending" &&
                          handout.lecturewisePlanLearningObjective == null
                            ? "Review"
                            : "Details"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-2 text-center">
                    No handouts found
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

export default DCAMemberHandouts;
