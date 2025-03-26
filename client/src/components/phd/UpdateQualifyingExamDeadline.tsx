import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


interface Semester {
  id: number;
  year: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface QualifyingExam {
  id: number;
  semesterId: number;
  examName: string;
  deadline: string;
  examStartDate?: string;
  examEndDate?: string;
  createdAt: string;
  semesterYear?: string;
  semesterNumber?: string;
}

const UpdateQualifyingExamDeadline: React.FC = () => {
  const queryClient = useQueryClient();
  const [examForm, setExamForm] = useState({
    examName: "Regular Qualifying Exam",
    deadline: "",
    examStartDate: "",
    examEndDate: ""
  });

  const { data: currentSemesterData, isLoading: isLoadingCurrentSemester } = useQuery({
    queryKey: ["current-phd-semester"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; semester: Semester; isActive: boolean }>(
        "/phd/staff/getCurrentSemester"
      );
      return response.data;
    }
  });

  const currentSemesterId = currentSemesterData?.semester?.id;
  const isActiveSemester = currentSemesterData?.isActive;

  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ["phd-qualifying-exams", currentSemesterId],
    queryFn: async () => {
      if (!currentSemesterId) return { success: true, exams: [] };
      const response = await api.get<{ success: boolean; exams: QualifyingExam[] }>(
        `/phd/staff/getAllQualifyingExamForTheSem/${currentSemesterId}`
      );
      const regularQualifyingExams = response.data.exams.filter(exam => exam.examName === "Regular Qualifying Exam");
      return { success: response.data.success, exams: regularQualifyingExams };
    },
    enabled: !!currentSemesterId
  });

  const examMutation = useMutation({
    mutationFn: async (formData: typeof examForm & { semesterId: number }) => {
      const response = await api.post("/phd/staff/updateQualifyingExamDeadline", formData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Qualifying exam deadline updated successfully");
      queryClient.invalidateQueries({ queryKey: ["phd-qualifying-exams", currentSemesterId] });
      setExamForm({
        examName: "Regular Qualifying Exam",
        deadline: "",
        examStartDate: "",
        examEndDate: ""
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.feedback || "Failed to update qualifying exam deadline";
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSemesterId) {
      toast.error("No active semester found");
      return;
    }

    if (!examForm.deadline || !examForm.examStartDate || !examForm.examEndDate) {
      toast.error("Please provide all dates");
      return;
    }

    const deadlineDate = new Date(examForm.deadline);
    const startDate = new Date(examForm.examStartDate);
    const endDate = new Date(examForm.examEndDate);

    if (deadlineDate >= startDate) {
      toast.error("Registration deadline must be before exam start date");
      return;
    }

    if (startDate >= endDate) {
      toast.error("Exam start date must be before exam end date");
      return;
    }

    const formattedData = {
      ...examForm,
      deadline: deadlineDate.toISOString(),
      examStartDate: startDate.toISOString(),
      examEndDate: endDate.toISOString(),
      semesterId: currentSemesterId
    };

    examMutation.mutate(formattedData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center">Qualifying Exam Deadline Management</h1>
        </div>

        {isLoadingCurrentSemester ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner className="h-12 w-12" />
          </div>
        ) : currentSemesterData?.semester ? (
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Semester Information */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Current Academic Semester</h2>
                <span 
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    isActiveSemester 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isActiveSemester ? "Active" : "Recent"}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {currentSemesterData.semester.year}-Semester {currentSemesterData.semester.semesterNumber}
                </p>
                <div className="text-sm text-gray-500">
                  <div>Start: {formatDate(currentSemesterData.semester.startDate)}</div>
                  <div>End: {formatDate(currentSemesterData.semester.endDate)}</div>
                </div>
              </div>
            </div>

            {/* Exam Deadline Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Exam Name:</Label>
                  <div className="font-bold">Regular Qualifying Exam</div>
                </div>
                <div>
                  <Label htmlFor="deadline">Registration Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={examForm.deadline}
                    onChange={(e) => setExamForm({ ...examForm, deadline: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="examStartDate">Exam Start Date</Label>
                  <Input
                    id="examStartDate"
                    type="datetime-local"
                    value={examForm.examStartDate}
                    onChange={(e) => setExamForm({ ...examForm, examStartDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="examEndDate">Exam End Date</Label>
                  <Input
                    id="examEndDate"
                    type="datetime-local"
                    value={examForm.examEndDate}
                    onChange={(e) => setExamForm({ ...examForm, examEndDate: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={examMutation.isLoading || !isActiveSemester}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  {examMutation.isLoading ? (
                    <LoadingSpinner className="h-5 w-5" />
                  ) : (
                    "Update Exam Deadline"
                  )}
                </Button>
                {!isActiveSemester && (
                  <p className="text-sm text-amber-600">
                    Warning: You are setting deadlines for a semester that is not currently active.
                  </p>
                )}
              </form>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-red-500">
              No semester configuration found. Please contact the system administrator.
            </p>
          </div>
        )}

        {/* Existing Exams Table */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="mb-4 text-lg font-medium">Current Qualifying Exam Deadlines</h3>
          {isLoadingExams ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner className="h-6 w-6" />
            </div>
          ) : (examsData?.exams && examsData.exams.length > 0) ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Exam Name</th>
                    <th className="border px-4 py-2 text-left">Registration Deadline</th>
                    <th className="border px-4 py-2 text-left">Exam Start</th>
                    <th className="border px-4 py-2 text-left">Exam End</th>
                    <th className="border px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {examsData.exams.map((exam) => {
                    const deadlineDate = new Date(exam.deadline);
                    const isActive = deadlineDate > new Date();
                    return (
                      <tr key={exam.id}>
                        <td className="border px-4 py-2">{exam.examName}</td>
                        <td className="border px-4 py-2">
                          {formatDate(exam.deadline)}
                        </td>
                        <td className="border px-4 py-2">
                          {exam.examStartDate ? formatDate(exam.examStartDate) : 'N/A'}
                        </td>
                        <td className="border px-4 py-2">
                          {exam.examEndDate ? formatDate(exam.examEndDate) : 'N/A'}
                        </td>
                        <td className="border px-4 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">
              No Regular Qualifying Exam deadlines set for this semester.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateQualifyingExamDeadline;