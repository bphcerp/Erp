import React, { useState } from "react";
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
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import SuggestDacMembers, { Student } from "@/components/phd/SuggestDacMembers";
import ProposalDocumentsModal from "@/components/phd/ProposalDocumentsModal";
import ProposalReviewDialog from "@/components/phd/ProposalReviewDialog";

// Define a more precise type for proposal documents
interface ProposalDocument {
  id: number;
  fieldName: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

// Response interface
export interface SupervisedStudentsResponse {
  success: boolean;
  students: StudentWithGroupedDocuments[];
}

// Extended Student interface with grouped documents
interface StudentWithGroupedDocuments
  extends Omit<Student, "proposalDocuments"> {
  proposalDocuments: DocumentBatch[];
}

// Define DocumentBatch type
interface DocumentBatch {
  documents: ProposalDocument[];
  uploadedAt: string;
}

const SupervisedStudents: React.FC = () => {
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithGroupedDocuments | null>(null);
  const [showDacSuggestion, setShowDacSuggestion] = useState(false);
  const [showProposalDocuments, setShowProposalDocuments] = useState(false);
  const [showProposalReview, setShowProposalReview] = useState(false);
  const [selectedDocumentBatch, setSelectedDocumentBatch] =
    useState<DocumentBatch | null>(null);

  const { data, isLoading, refetch } = useQuery<SupervisedStudentsResponse>({
    queryKey: ["phd-supervised-students"] as const,
    queryFn: async () => {
      const response = await api.get("/phd/supervisor/getSupervisedStudents");
      return {
        ...response.data,
        students: response.data.students.map((student: Student) => ({
          ...student,
          proposalDocuments: groupProposalDocuments(
            student.proposalDocuments || []
          ),
        })),
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Add this method to your SupervisedStudents component
  const convertToStudent = (student: StudentWithGroupedDocuments): Student => {
    const { proposalDocuments, ...baseStudent } = student;
    return {
      ...baseStudent,
      proposalDocuments: proposalDocuments.flatMap((batch) => batch.documents),
    };
  };

  // Function to group proposal documents
  const groupProposalDocuments = (
    documents: ProposalDocument[]
  ): DocumentBatch[] => {
    const groups: DocumentBatch[] = [];

    documents.forEach((doc) => {
      const timestamp = new Date(doc.uploadedAt).getTime();

      // Find an existing group within 1 minute
      const existingGroup = groups.find(
        (group) =>
          Math.abs(new Date(group.uploadedAt).getTime() - timestamp) <=
          1 * 60 * 1000
      );

      if (existingGroup) {
        existingGroup.documents.push(doc);
      } else {
        groups.push({
          documents: [doc],
          uploadedAt: doc.uploadedAt,
        });
      }
    });

    return groups;
  };

  const handleViewDetails = (
    student: StudentWithGroupedDocuments,
    documentBatch: DocumentBatch
  ) => {
    setSelectedStudent(student);
    setSelectedDocumentBatch(documentBatch);
    setShowProposalDocuments(true);
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    setSelectedDocumentBatch(null);
    setShowProposalDocuments(false);
    refetch();
  };

  const handleSuggestDacMembers = (student: StudentWithGroupedDocuments) => {
    setSelectedStudent(student);
    setShowDacSuggestion(true);
  };

  const handleCloseDacSuggestion = () => {
    setShowDacSuggestion(false);
    setSelectedStudent(null);
    refetch();
  };

  const handleOpenProposalReview = (student: StudentWithGroupedDocuments) => {
    setSelectedStudent(student);
    setShowProposalReview(true);
  };

  const handleCloseProposalReview = () => {
    setSelectedStudent(null);
    setShowProposalReview(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Supervised Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Name</TableHead>
                <TableHead className="w-1/3">Email</TableHead>
                <TableHead className="w-1/6">Proposal Documents</TableHead>
                <TableHead className="w-1/6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.students && data.students.length > 0 ? (
                data.students.map((student) => (
                  <TableRow key={student.email}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {student.proposalDocuments &&
                      student.proposalDocuments.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600"
                        >
                          Available ({student.proposalDocuments.length})
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-600"
                        >
                          Not Available
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {student.proposalDocuments.map((batch, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(student, batch)}
                          >
                            Batch {index + 1}
                          </Button>
                        ))}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSuggestDacMembers(student)}
                        >
                          Suggest DAC
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    No students under your supervision yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStudent && showProposalDocuments && selectedDocumentBatch && (
        <ProposalDocumentsModal
          student={convertToStudent(selectedStudent)}
          documentBatch={{
            documents: selectedDocumentBatch.documents,
            uploadedAt: selectedDocumentBatch.uploadedAt,
          }}
          onClose={handleCloseDetails}
          onReview={() => {
            handleCloseDetails();
            handleOpenProposalReview(selectedStudent);
          }}
        />
      )}

      {selectedStudent && showDacSuggestion && (
        <SuggestDacMembers
          student={convertToStudent(selectedStudent)}
          onClose={handleCloseDacSuggestion}
        />
      )}

      {selectedStudent && showProposalReview && (
        <ProposalReviewDialog
          studentEmail={selectedStudent.email}
          studentName={selectedStudent.name}
          onClose={handleCloseProposalReview}
        />
      )}
    </div>
  );
};

export default SupervisedStudents;
