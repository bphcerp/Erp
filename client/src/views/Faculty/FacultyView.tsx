import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FormData {
  courseCode: string;
  courseName: string;
  courseStrength: string;
  openBook: string;
  closedBook: string;
  midSem: string;
  compre: string;
}

interface OtherComponent {
  name: string;
  weightage: string;
}

const initialFormData: FormData = {
  courseCode: "",
  courseName: "",
  courseStrength: "",
  openBook: "",
  closedBook: "",
  midSem: "",
  compre: "",
};

const CourseHandouts = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [otherComponents, setOtherComponents] = useState<OtherComponent[]>([]);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddComponent = () => {
    setOtherComponents((prev) => [...prev, { name: "", weightage: "" }]);
  };

  const handleOtherComponentChange = (
    index: number,
    fieldName: keyof OtherComponent,
    value: string
  ) => {
    const updatedComponents = [...otherComponents];
    updatedComponents[index][fieldName] = value;
    setOtherComponents(updatedComponents);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key as keyof FormData] = "This field is required";
        isValid = false;
      }
    });

    // Validate percentages
    const { openBook, closedBook, midSem, compre } = formData;
    const totalPercentage =
      parseFloat(openBook || "0") +
      parseFloat(closedBook || "0") +
      parseFloat(midSem || "0") +
      parseFloat(compre || "0") +
      otherComponents.reduce(
        (sum, component) => sum + parseFloat(component.weightage || "0"),
        0
      );

    if (![99, 100, 101].includes(totalPercentage)) {
      newErrors.openBook =
        "Total percentage must be either 99%, 100%, or 101%";
      isValid = false;
    }

    if (parseFloat(openBook || "0") < 20) {
      newErrors.openBook = "Open Book percentage must be at least 20%";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated API call
      toast.success("Course handout submitted successfully");
      setFormData(initialFormData);
      setOtherComponents([]);
    } catch (error) {
      toast.error("Failed to submit course handout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-row items-start gap-8 p-8">
      <form
        onSubmit={handleSubmit}
        className="w-3/4 space-y-4 rounded-lg bg-white p-6 shadow"
      >
        <h1 className="mb-4 text-2xl font-bold p-2 rounded">
          Course Handout Verification
        </h1>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <label className="font-semibold">Enter Course Code</label>
          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleInputChange}
            className={`w-full rounded border px-3 py-2 ${
              errors.courseCode ? "border-red-500" : ""
            }`}
          />

          <label className="font-semibold">Enter Course Name</label>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleInputChange}
            className={`w-full rounded border px-3 py-2 ${
              errors.courseName ? "border-red-500" : ""
            }`}
          />

          <label className="font-semibold">Approx. Course Strength</label>
          <input
            type="number"
            name="courseStrength"
            value={formData.courseStrength}
            onChange={handleInputChange}
            className={`w-full rounded border px-3 py-2 ${
              errors.courseStrength ? "border-red-500" : ""
            }`}
          />

          <label className="font-semibold">Open Book %</label>
          <input    
            type="number"
            name="openBook"
            value={formData.openBook}
            onChange={handleInputChange}
            className={`w-full rounded border px-3 py-2 ${
              errors.openBook ? "border-red-500" : ""
            }`}
          />

          <label className="font-semibold">Closed Book %</label>
          <input
            type="number"
            name="closedBook"
            value={formData.closedBook}
            onChange={handleInputChange}
            className={`w-full rounded border px-3 py-2 ${
              errors.closedBook ? "border-red-500" : ""
            }`}
          />

          <label className="font-semibold">% Mid-Sem</label>
          <input
            type="number"
            name="midSem"
            value={formData.midSem}
            onChange={handleInputChange}
            className={`w-full rounded border px-3 py-2 ${
              errors.midSem ? "border-red-500" : ""
            }`}
          />

          <label className="font-semibold">% Compre</label>
          <input
            type="number"
            name="compre"
            value={formData.compre}
            onChange={handleInputChange}
            className={`w-full rounded border px-3 py-2 ${
              errors.compre ? "border-red-500" : ""
            }`}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={handleAddComponent}
            className="font-semibold text-blue-500 hover:text-blue-700"
          >
            + Add Other Component
          </button>
          {otherComponents.map((component, index) => (
            <div key={index} className="mt-2 grid grid-cols-2 gap-x-8">
              <input
                type="text"
                placeholder="Component Name"
                value={component.name}
                onChange={(e) =>
                  handleOtherComponentChange(index, "name", e.target.value)
                }
                className="rounded border px-3 py-2"
              />
              <input
                type="number"
                placeholder="Weightage %"
                value={component.weightage}
                onChange={(e) =>
                  handleOtherComponentChange(index, "weightage", e.target.value)
                }
                className="rounded border px-3 py-2"
              />
            </div>
          ))}
        </div>

        {Object.values(errors).some(Boolean) && (
          <p className="mt-2 text-sm text-red-500">
            Please fix the errors above before submitting.
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              Submitting...
              <span className="ml-2 h-4 w-4 animate-spin rounded-full border-t border-white"></span>
            </span>
          ) : (
            "Submit"
          )}
        </Button>
      </form>

      <div className="flex flex-col gap-y-4">
        <Button variant={"outline"}>Select File</Button>
        <Button variant={"outline"}>Upload File</Button>
        <Button type={"submit"} onClick={()=>{isSubmitting}}>Submit</Button>
      </div>
    </div>
  );
};

export default CourseHandouts;
