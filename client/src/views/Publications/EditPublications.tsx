import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { useState,useMemo } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CoAuthor = {
  authorId: string;
  authorName: string;
};

type Publication = {
  title: string;
  type: string;
  journal: string;
  volume: string | null;
  issue: string | null;
  year: string;
  link: string;
  citations: string;
  citationId: string;
  authorNames: string;
  coAuthors: CoAuthor[];
  comments?: string | null;
};

import { z } from "zod";

const PublicationSchema = z.object({
  citationId: z.string(),
  title: z.string(),
  type: z.string().nullable(),
  status: z.boolean().nullable(),
  journal: z.string().nullable(),
  volume: z.string().nullable(),
  issue: z.string().nullable(),
  year: z.string().nullable(),
  link: z.string().nullable(),
  citations: z.string().nullable(),
  authorNames: z.string().nullable(),
  comments: z.string().nullable(),
});

type PublicationResponse = {
  publications: Publication[];
};

type EditingPublication = Publication & {
  isEditing?: boolean;
};

const EditPublications = () => {
  const [editingPublications, setEditingPublications] = useState<
    Record<string, EditingPublication>
  >({});
  const queryClient = useQueryClient();

  const {
    data: publicationsData,
    isLoading: isLoadingPubs,
    isError: isPubsError,
  } = useQuery({
    queryKey: ["publications/all"],
    queryFn: async () => {
      const response = await api.get<PublicationResponse>("/publications/all");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updatePublicationMutation = useMutation({
    mutationFn: async (publication: Publication) => {
      const filteredPublication = PublicationSchema.parse(publication);

      const response = await api.patch("/publications/edit", {
        publication: filteredPublication,
      });

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications/all"] });
      toast.success("Publication updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update publication");
      console.error("Update error:", error);
    },
  });

  const handleEdit = (publication: Publication) => {
    setEditingPublications({
      ...editingPublications,
      [publication.citationId]: { ...publication, isEditing: true },
    });
  };

  const handleCancelEdit = (citationId: string) => {
    const newEditingPublications = { ...editingPublications };
    delete newEditingPublications[citationId];
    setEditingPublications(newEditingPublications);
  };

  const handleSave = (citationId: string) => {
    const publicationToUpdate = editingPublications[citationId];
    if (publicationToUpdate) {
      updatePublicationMutation.mutate(publicationToUpdate);
      handleCancelEdit(citationId);
    }
  };

  const handleChange = (
    citationId: string,
    field: keyof Publication,
    value: string
  ) => {
    setEditingPublications({
      ...editingPublications,
      [citationId]: {
        ...editingPublications[citationId],
        [field]: value,
      },
    });
  };

  const sortedGroupedPublications = useMemo(() => {
    if (!publicationsData?.publications) return {};

    // Group publications by type
    const grouped = publicationsData.publications.reduce(
      (groups, publication) => {
        const type = publication.type || "Uncategorized";
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(publication);
        return groups;
      },
      {} as Record<string, Publication[]>
    );

    // Sort groups and publications within each group
    const sorted = Object.keys(grouped)
      .sort()
      .reduce(
        (acc, type) => {
          acc[type] = grouped[type].sort(
            (a, b) => Number(b.year) - Number(a.year)
          );
          return acc;
        },
        {} as Record<string, Publication[]>
      );

    return sorted;
  }, [publicationsData]);


  const renderPublicationsTable = (
    publications: Publication[],
    type: string
  ) => (
    <Card key={type} className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">
          {type} ({publications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Authors</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Journal</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publications.map((publication) => {
                const isEditing = !!editingPublications[publication.citationId];
                const editingPublication = isEditing
                  ? editingPublications[publication.citationId]
                  : publication;

                return (
                  <TableRow key={publication.citationId}>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={editingPublication.authorNames}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "authorNames",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        publication.authorNames
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPublication.title}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "title",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        publication.title
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPublication.type}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "type",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        <span className="rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground">
                          {publication.type}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPublication.journal}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "journal",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        <em>{publication.journal}</em>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPublication.volume || ""}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "volume",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        publication.volume || "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPublication.issue || ""}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "issue",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        publication.issue || "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPublication.year}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "year",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        <span className="font-semibold">
                          {publication.year}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingPublication.comments || ""}
                          onChange={(e) =>
                            handleChange(
                              publication.citationId,
                              "comments",
                              e.target.value
                            )
                          }
                          className="w-full"
                        />
                      ) : (
                        publication.comments || "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleSave(publication.citationId)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleCancelEdit(publication.citationId)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(publication)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-start gap-6 p-8">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">
          Edit Publications
        </h1>
        <div className="text-sm text-muted-foreground">
          Total: {publicationsData?.publications?.length || 0} publications
        </div>
      </div>

      {isPubsError ? (
        <p className="text-destructive">
          An error occurred while fetching publications.
        </p>
      ) : isLoadingPubs ? (
        <LoadingSpinner />
      ) : Object.keys(sortedGroupedPublications).length > 0 ? (
        <div className="w-full">
          {Object.entries(sortedGroupedPublications).map(
            ([type, publications]) =>
              renderPublicationsTable(publications, type)
          )}
        </div>
      ) : (
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No publications found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EditPublications;
