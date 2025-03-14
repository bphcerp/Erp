import api from "@/lib/axios-instance";
import { useQuery } from "@tanstack/react-query";
import ExamDateDisplay from "@/components/phd/ExamDateDisplay";
const ProposalSubmission: React.FC = () => {
  const { data: examStatus, isFetching } = useQuery({
    queryKey: ["phd-student-exams"],
    queryFn: async () => {
      const response = await api.get<{ status: any }>(
        "/phd/student/getQualifyingExamStatus"
      );
      console.log(response.data);
      return response.data?.status;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const { data: proposalDeadline, isFetching: isFetchingProposalDeadline } =
    useQuery({
      queryKey: ["phd-students"],
      queryFn: async () => {
        const response = await api.get<{ deadline: string }>(
          "/phd/student/getProposalDeadLine"
        );
        console.log(response.data);
        return response.data;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    });
  return (
    <main className="min-h-screen w-full bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      {examStatus == "pass" ? (
        <>
          <h1 className="mb-8 text-center text-3xl font-bold">
            Proposal Submission
          </h1>
          <div className="flex flex-col gap-8">
            {isFetchingProposalDeadline && <p>Loading...</p>}
            {proposalDeadline?.deadline ? (
              <ExamDateDisplay
                examDate={proposalDeadline?.deadline}
                title="Proposal Deadline"
              />
            ) : (
              <span>No Deadline has been set yet</span>
            )}
          </div>
        </>
      ) : (
        <h1 className="mb-8 text-center text-3xl font-bold">
          Not applicable for proposal submission yet.
        </h1>
      )}
    </main>
  );
};

export default ProposalSubmission;
