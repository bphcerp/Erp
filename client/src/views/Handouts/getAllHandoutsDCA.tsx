import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { handoutSchemas } from "lib";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RefreshCcw } from "lucide-react";

interface HandoutRequest {
  id: string;
  courseName: string;
  courseCode: string;
  professorName: string;
  status: handoutSchemas.HandoutStatus;
}

const STATUS_COLORS: Record<handoutSchemas.HandoutStatus, string> = {
  pending: "text-yellow-600",
  approved: "text-green-600",
  rejected: "text-red-600",
  notsubmitted: "text-gray-500",
};

const GetAllHandoutsDCA: React.FC = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filteredHandouts, setFilteredHandouts] = useState<HandoutRequest[]>([]);
  const [handouts, setHandouts] = useState<HandoutRequest[]>([]);
  
  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: async () => {
      const response = await api.get("handout/dca/get");
      console.log("API Response:", response);
      return response.data;
    },
    onSuccess: (data) => {
      setHandouts(data.handouts || []);
      toast.success("Handouts loaded successfully");
    },
    onError: (err) => {
      console.error("Mutation Error:", err);
      toast.error(`Failed to fetch handouts: ${err instanceof Error ? err.message : 'Unknown error'}`);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  useEffect(() => {
    const filtered = selectedStatuses.length
      ? handouts.filter((handout) => selectedStatuses.includes(handout.status))
      : handouts;
    setFilteredHandouts(filtered);
  }, [handouts, selectedStatuses]);

  const refreshHandouts = () => {
    mutate();
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
    
  if (isError)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error fetching handout requests: {error instanceof Error ? error.message : 'Unknown error'}
        <Button 
          onClick={refreshHandouts} 
          className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
        >
          Retry
        </Button>
      </div>
    );

  return (
    <div className="h-screen w-full p-6">
      <div className="h-full overflow-hidden rounded-lg bg-white">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">
                Pending Handout Reviews
              </h1>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={refreshHandouts}
                  variant="outline"
                  className="mr-2"
                >
                  <RefreshCcw/>
                </Button>
                <ToggleGroup
                  type="multiple"
                  value={selectedStatuses}
                  onValueChange={setSelectedStatuses}
                  className="space-x-2 bg-transparent"
                >
                  {["pending", "notsubmitted"].map((status) => (
                    <ToggleGroupItem
                      key={status}
                      value={status}
                      className="border capitalize"
                    >
                      {status === "notsubmitted" ? "Not Submitted" : status}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </div>
          <div className="flex-grow overflow-auto p-6">
            <Table className="w-full rounded-lg border">
              <TableHeader className="sticky top-0 bg-gray-100">
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHandouts.length ? (
                  filteredHandouts.map((handout) => (
                    <TableRow key={handout.id}>
                      <TableCell>{handout.courseCode}</TableCell>
                      <TableCell>{handout.courseName}</TableCell>
                      <TableCell>{handout.professorName}</TableCell>
                      <TableCell>
                        <span
                          className={`uppercase ${STATUS_COLORS[handout.status]}`}
                        >
                          {handout.status === "notsubmitted" 
                            ? "Not Submitted" 
                            : handout.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          asChild
                          variant="outline"
                          className="hover:bg-primary hover:text-white"
                        >
                          <Link to={`/handout/dca/review/${handout.id}`}>Review</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No pending handout reviews found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetAllHandoutsDCA;
