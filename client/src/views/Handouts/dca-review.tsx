import React from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";  
import ReviewField from "@/components/handouts/reviewField";

interface HandoutReviewFormValues {
  handoutId: string;
  scopeAndObjective: boolean;
  textBookPrescribed: boolean;
  lecturewisePlanLearningObjective: boolean;
  lecturewisePlanCourseTopics: boolean;
  numberOfLP: boolean;
  evaluationScheme: boolean;
}

const DCAMemberReviewForm: React.FC = () => {
  const { handoutId } = useParams<{ handoutId: string }>();
  const queryClient = useQueryClient();

  const { handleSubmit, register, control } = useForm<HandoutReviewFormValues>({
    defaultValues: {
      handoutId: handoutId || "",
      scopeAndObjective: false,
      textBookPrescribed: false,
      lecturewisePlanLearningObjective: false,
      lecturewisePlanCourseTopics: false,
      numberOfLP: false,
      evaluationScheme: false,
    },
  });

  const submitReview = useMutation(
    async (data: HandoutReviewFormValues) => {
      const response = await api.post("/handout/createDCAMemberReview", data);
      console.log("response", response.data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Handout review successfully submitted");
        console.log("Handout review submitted:", data);
        queryClient.invalidateQueries({ queryKey: ["handouts"] });
      },
      onError: (error: any) => {
        console.log("Error submitting handout review:", error.response?.data);
        toast.error("An error occurred while submitting the review");
      },
    }
  );
  
  const onSubmit = (data: HandoutReviewFormValues) => {
    submitReview.mutate(data);
  };


  
  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl text-center font-bold mb-4">Handout Review</h1>
      <p className="text-center text-muted-foreground mb-8">
        Review the handout and approve or reject each section.
      </p>
      
      {submitReview.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-md">
          {(submitReview.error as any).message || "An error occurred"}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("handoutId")} />

        <div className="space-y-4">
          <ReviewField
            name="scopeAndObjective"
            label="Scope and Objective"
            description="Check if scope and objectives are clearly defined"
            control={control}
          />
          <ReviewField
            name="textBookPrescribed"
            label="Textbook Prescribed"
            description="Verify if appropriate textbooks are listed"
            control={control}
          />
          <ReviewField
            name="lecturewisePlanLearningObjective"
            label="Learning Objectives"
            description="Check if learning objectives for each lecture are defined"
            control={control}
          />
          <ReviewField
            name="lecturewisePlanCourseTopics"
            label="Course Topics"
            description="Review the lecture-wise course topics"
            control={control}
          />
          <ReviewField
            name="numberOfLP"
            label="Number of Learning Points"
            description="Ensure sufficient learning points are included"
            control={control}
          />
          <ReviewField
            name="evaluationScheme"
            label="Evaluation Scheme"
            description="Check if the evaluation scheme is appropriate"
            control={control}
          />
        </div>

        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Check the box to approve; leave unchecked to reject each section.
          </p>
        </div>
        <Button
        type="submit"
        disabled={submitReview.isLoading}
        className="ms-auto float-right px-4 py-2 text-sm w-auto justify-center"
>            {submitReview.isLoading ? "Submitting..." : "Submit Review"}
          </Button>
      </form>
    </div>
  );
};

export default DCAMemberReviewForm;
