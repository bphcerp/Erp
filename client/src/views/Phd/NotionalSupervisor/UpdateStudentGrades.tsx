import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { LoadingSpinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // adjust this path to where your table components live
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface PhdStudent {
  name: string;
  email: string;
  erpId: string;
}

const PhdStudentList: React.FC = () => {
  const { data: students, isFetching } = useQuery({
    queryKey: ["phd-students"],
    queryFn: async () => {
      const response = await api.get<{ phdRecords: PhdStudent[] }>(
        "/phd/notionalSupervisor/getPhdWithErpId"
      );
      return response.data?.phdRecords;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen w-full bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">
          PhD Students
        </h1>

        {isFetching ? (
          <LoadingSpinner className="mx-auto" />
        ) : students && students.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border bg-white shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ERP ID</TableHead>
                  <TableHead className="w-20 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.email}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.erpId}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm">
                        <Pencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No PhD students under your supervision
          </p>
        )}
      </div>
    </div>
  );
};

export default PhdStudentList;
