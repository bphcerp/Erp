import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Review from "@/components/handouts/review";
import api from "@/lib/axios-instance";
import { Handout } from "./DCAReview";
import { BASE_API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const FacultyHandout: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: [`handout-faculty ${id}`],
    queryFn: async () => {
      try {
        const response = await api.get<{ status: boolean; handout: Handout }>(
          `/handout/get?handoutId=${id}`
        );
        return response.data.handout;
      } catch (error) {
        toast.error("Failed to fetch handouts");
        throw error;
      }
    },
  });

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

  const goBack = () => {
    navigate("/handout/faculty");
  };
  return (
    <div className="container mx-auto px-4 py-10">
      <Button
        variant={"ghost"}
        onClick={goBack}
        className="size-sm mb-4 flex items-center"
      >
        <ChevronLeft className="mr-1" size={16} />
        Back to Dashboard
      </Button>
      <h1 className="mb-4 text-center text-2xl font-bold">Handout</h1>
      <p className="mb-2 text-center text-muted-foreground">
        <span className="font-bold">Course Name :</span> {data.courseName}
      </p>
      <p className="mb-2 text-center text-muted-foreground">
        <span className="font-bold">Course Code :</span> {data.courseCode}
      </p>
      <p className="mb-2 text-center text-muted-foreground">
        <span className="font-bold">Mid Semester Weightage : </span>
        {data.midSem}%
      </p>
      <p className="mb-2 text-center text-muted-foreground">
        <span className="font-bold">Compre Weightage :</span> {data.compre}%
      </p>
      <p className="mb-2 text-center text-muted-foreground">
        <span className="font-bold">Open Book :</span> {data.openBook}%
      </p>
      <p className="mb-4 text-center text-muted-foreground">
        <span className="font-bold">No. of Other Evaluatives :</span>{" "}
        {data.otherEvals}
      </p>
      <div className="flex space-x-4">
        {data.handoutFilePath != null ? (
          <iframe
            src={`${BASE_API_URL}f/${data.handoutFilePath.fileId}`}
            className="my-2 h-[90vh] max-h-[550px] w-full self-center"
          ></iframe>
        ) : (
          <div className="grid h-full place-items-center font-bold text-muted-foreground">
            <span>Handout Yet To be Submitted</span>
          </div>
        )}

        <div className="w-full scale-90 space-y-4">
          {data.evaluationScheme != null ? (
            <>
              <div className="space-y-4">
                <Review
                  name="scopeAndObjective"
                  label="Scope and Objective"
                  description="Check if scope and objectives are clearly defined"
                  value={data.scopeAndObjective}
                />
                <Review
                  name="textBookPrescribed"
                  label="Textbook Prescribed"
                  description="Verify if appropriate textbooks are listed"
                  value={data.textBookPrescribed}
                />
                <Review
                  name="lecturewisePlanLearningObjective"
                  label="Learning Objectives"
                  description="Check if learning objectives for each lecture are defined"
                  value={data.lecturewisePlanLearningObjective}
                />
                <Review
                  name="lecturewisePlanCourseTopics"
                  label="Course Topics"
                  description="Review the lecture-wise course topics"
                  value={data.lecturewisePlanCourseTopics}
                />
                <Review
                  name="numberOfLP"
                  label="Number of Learning Points"
                  description="Ensure sufficient learning points are included"
                  value={data.numberOfLP}
                />
                <Review
                  name="evaluationScheme"
                  label="Evaluation Scheme"
                  description="Check if the evaluation scheme is appropriate"
                  value={data.evaluationScheme}
                />

                {data.comments ? (
                  <div className="flex max-w-[28vw] flex-col text-muted-foreground">
                    <div className="mb-2 font-bold">DCA Comments :</div>
                    <div className="ml-4 overflow-hidden break-words text-center">
                      {data.comments}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </>
          ) : (
            <p className="grid h-full place-items-center font-bold text-muted-foreground">
              <span>Handout Yet To be Reviewed</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyHandout;
