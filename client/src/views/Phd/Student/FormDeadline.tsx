import api from "@/lib/axios-instance";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import ExamForm from "@/components/phd/QualifyingExamForm";
import ExamDateDisplay from "@/components/phd/ExamDateDisplay";

interface Exam {
  id: number;
  examName: string;
  deadline: Date;
  semesterYear?: number;
  semesterNumber?: number;
}

interface BackendResponse {
  success: boolean;
  exams: Exam[];
}

const FormDeadline: React.FC = () => {
  const { data, isLoading, error } = useQuery<BackendResponse>({
    queryKey: ["get-qualifying-exam-deadline"],
    queryFn: async () => {
      const response = await api.get<BackendResponse>("/phd/student/getQualifyingExamDeadLine",{
        params: {
          name: "Regular Qualifying Exam",
        }
      });
      const currentDate = new Date();
      if (new Date(response.data.exams[0].deadline) > currentDate) {
        return response.data;
      } else {
        return {
          success: false,
          exams: [],
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });


  return (
    <main className="min-h-screen w-full bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Qualifying Exam Registration
      </h1>
      
      <div className="flex flex-col gap-8">
        {isLoading && (
          <div className="text-center">
            <p>Loading deadline information...</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {data?.exams?.length ?? 0 > 0 ? (
              <>
                <div className="overflow-hidden rounded-lg bg-white shadow">
                  <ExamDateDisplay 
                    examDate={data?.exams[0].deadline ? data?.exams[0].deadline : "Invalid Date"} 
                    title={`Registration Deadline: ${data?.exams[0].examName}`} 
                  />
                </div>

                <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
                  <h2 className="mb-4 text-xl font-semibold">Exam Registration</h2>
                  <p className="mb-6">
                    Please complete the registration form below before the deadline.
                    You can also access the
                    <a
                      href="https://www.bits-pilani.ac.in/wp-content/uploads/1.-Format-for-application-to-DRC-for-Ph.D-Qualifying-Examination.pdf"
                      className="mx-1 font-medium text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      external registration form
                    </a>
                    if needed.
                  </p>
                  {/* Use ExamForm without the examId prop as it's not in the component's interface */}
                  <ExamForm />
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-center text-lg">
                  There are currently no active qualifying exam deadlines.
                </p>
                <p className="mt-2 text-center text-gray-500">
                  Registration will open when the next exam deadline is announced.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};


export default FormDeadline;