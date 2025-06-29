import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterBar } from "@/components/handouts/filterBar";
import { STATUS_COLORS } from "@/components/handouts/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface HandoutSummary {
  id: string;
  courseCode: string;
  icName: string;
  professorName: string;
  reviewerName: string;
  status: string;
  submittedOn: string;
  category: string;
  scopeAndObjective: boolean;
  textBookPrescribed: boolean;
  lecturewisePlanLearningObjective: boolean;
  lecturewisePlanCourseTopics: boolean;
  numberOfLP: boolean;
  evaluationScheme: boolean;
}

// No longer need ExcelResponse as the server handles ZIP creation
// interface ExcelResponse {
//   hdHandouts: Record<string, string>[];
//   fdHandouts: Record<string, string>[];
//   headers: string[];
// }

const DCAConvenerSummary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>(
    []
  );
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<HandoutSummary[]>([]);

  const {
    data: handouts,
    isLoading,
    isError,
  } = useQuery<HandoutSummary[]>({
    queryKey: ["handouts-dca-convenor"],
    queryFn: async () => {
      try {
        const response = await api.get<{
          success: boolean;
          handouts: HandoutSummary[];
        }>("/handout/dcaconvenor/get");
        return response.data.handouts;
      } catch (error) {
        toast.error("Failed to fetch handouts");
        throw error;
      }
    },
  });

  useEffect(() => {
    if (!handouts) {
      setFilteredData([]);
      return;
    }
    let results = handouts;

    if (searchQuery) {
      results = results.filter(
        (handout) =>
          handout.courseCode
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          handout.icName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          handout.reviewerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategoryFilters.length > 0) {
      results = results.filter((handout) =>
        activeCategoryFilters.includes(handout.category)
      );
    }
    if (activeStatusFilters.length > 0) {
      results = results.filter((handout) =>
        activeStatusFilters.includes(handout.status)
      );
    }

    setFilteredData(results);
  }, [handouts, searchQuery, activeCategoryFilters, activeStatusFilters]);

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get("/handout/dcaconvenor/exportSummary", {
        responseType: "blob",
      });
      return response.data as Blob;
    },
    onSuccess: (data) => {
      const blob = new Blob([data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "handout_summary.zip";
      anchor.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export successful!");
    },
    onError: (error) => {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    },
  });

  const handleExportZip = () => {
    exportMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <p>Error fetching handouts</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="px-2 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Summary Page DCA Convenor
            </h1>
            <p className="mt-2 text-gray-600">2nd semester 2024-25</p>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                className="hover:bg-primary hover:text-white"
                onClick={handleExportZip}
                disabled={exportMutation.isLoading}
              >
                {exportMutation.isLoading ? "Exporting..." : "Export All Handouts (ZIP)"}
              </Button>
            </div>
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
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="px-4 py-2">Course Code</TableHead>
              <TableHead className="px-4 py-2">Category</TableHead>
              <TableHead className="px-4 py-2">IC Name</TableHead>
              <TableHead className="px-4 py-2">Reviewer Name</TableHead>
              <TableHead className="px-4 py-2">Status</TableHead>
              <TableHead className="px-4 py-2">Submitted On</TableHead>
              <TableHead className="px-4 py-2">Scope &amp; Objective</TableHead>
              <TableHead className="px-4 py-2">Textbook Prescribed</TableHead>
              <TableHead className="px-4 py-2">Learning Objective</TableHead>
              <TableHead className="px-4 py-2">Course Topics</TableHead>
              <TableHead className="px-4 py-2">No. of LP</TableHead>
              <TableHead className="px-4 py-2">Evaluation Scheme</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-300">
            {filteredData && filteredData.length ? (
              filteredData.map((handout) => (
                <TableRow
                  key={handout.id}
                  className="odd:bg-white even:bg-gray-100"
                >
                  <TableCell className="px-4 py-2">
                    {handout.courseCode}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {handout.category}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {handout.professorName}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {handout.reviewerName}
                  </TableCell>
                  <TableCell
                    className={`px-4 py-2 capitalize ${STATUS_COLORS[handout.status]}`}
                  >
                    {handout.status}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {new Date(handout.submittedOn).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={handout.scopeAndObjective}
                      disabled
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={handout.textBookPrescribed}
                      disabled
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={handout.lecturewisePlanLearningObjective}
                      disabled
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={handout.lecturewisePlanCourseTopics}
                      disabled
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={handout.numberOfLP}
                      disabled
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={handout.evaluationScheme}
                      disabled
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="px-4 py-2 text-center">
                  No handouts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DCAConvenerSummary;
