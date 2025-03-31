
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { handoutSchemas } from "lib";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";

interface Handout {
  id: string;
  courseName: string;
  courseCode: string;
  professorName?: string;
  reviewerName?: string;
  submittedOn: string;
  status: handoutSchemas.HandoutStatus;
}

const STATUS_COLORS: Record<handoutSchemas.HandoutStatus, string> = {
  pending: "text-yellow-600",
  approved: "text-green-600",
  rejected: "text-red-600",
  notsubmitted: "text-gray-500",
};

const DCAConvenorHandouts: React.FC = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filteredHandouts, setFilteredHandouts] = useState<Handout[]>([]);
  const {
    data: handouts,
    isLoading,
    isError,
  } = useQuery<Handout[]>({
    queryKey: ["handouts-dca-convenor"],
    queryFn: async () => {
      try {
        const response = await api.get("/handout/dcaconvenor/get");
        return response.data.handouts;
      } catch (error) {
        toast.error("Failed to fetch handouts");
        throw error;
      }
    },
  });

  useMemo(() => {
    if (handouts) {
      const filtered = selectedStatuses.length
        ? handouts.filter((handout) =>
            selectedStatuses.includes(handout.status)
          )
        : handouts;
      setFilteredHandouts(filtered);
    }
  }, [handouts, selectedStatuses]);

  if (isLoading)
    return (
      <div className="mx-auto flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (isError)
    return (
      <div className="mx-auto flex h-screen items-center justify-center text-red-500">
        Error fetching handouts
      </div>
    );

  return (
    <div className="h-screen w-full p-4 md:p-6">
      <div className="flex h-full flex-col">
        <div className="border-b p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              DCA Convenor Handouts
            </h1>
            <ToggleGroup
              type="multiple"
              value={selectedStatuses}
              onValueChange={setSelectedStatuses}
              className="flex flex-wrap gap-2 bg-transparent"
            >
              {handoutSchemas.handoutStatuses.map((status) => (
                <ToggleGroupItem
                  key={status}
                  value={status}
                  className="border capitalize text-xs md:text-sm"
                >
                  {status}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-4 md:p-6">
          <div className="space-y-4">
            {filteredHandouts.length ? (
              filteredHandouts.map((handout) => (
                <Card
                  key={handout.id}
                  className="w-full border border-l-4 hover:shadow-md transition-all duration-200"
                  style={{ borderLeftColor: handout.status === 'approved' ? '#10b981' :
                                        handout.status === 'rejected' ? '#ef4444' :
                                        handout.status === 'pending' ? '#f59e0b' : '#9ca3af' }}
                >
                  <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-semibold text-gray-900">{handout.courseCode}</div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${STATUS_COLORS[handout.status]}`}>
                          {handout.status}
                        </span>
                      </div>

                      <div className="text-sm md:text-base font-medium text-gray-700">{handout.courseName}</div>

                      <div className="flex flex-wrap gap-x-6 mt-2 text-xs md:text-sm text-gray-500">
                        <div>IC: {handout.professorName || "Unassigned"}</div>
                        <div>Reviewer: {handout.reviewerName || "Unassigned"}</div>
                        <div>Submitted: {new Date(handout.submittedOn).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="self-start md:self-center">
                      {!handout.reviewerName ? (
                        <Button
                          asChild
                          variant="outline"
                          className="whitespace-nowrap hover:bg-primary hover:text-white"
                        >
                          <Link to={`/handout/assignreviewer/${handout.id}`}>
                            Assign Reviewer
                          </Link>
                        </Button>
                      ) : handout.status === "pending" ||
                        handout.status === "notsubmitted" ? (
                        <Button
                          asChild
                          variant="outline"
                          className="whitespace-nowrap hover:bg-primary hover:text-white"
                        >
                          <Link to={`/handout/dca/review/${handout.id}`}>
                            Review
                          </Link>
                        </Button>
                      ) : (
                        <div className="text-gray-400 text-sm">None</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="w-full p-8 text-center text-gray-500">
                No handouts found
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCAConvenorHandouts;