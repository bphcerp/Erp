import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios-instance";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { isAxiosError } from "axios";

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
};

type PublicationResponse = {
  publications: Publication[];
};

const PublicationsView = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: authorId,
    isLoading: isLoadingAuthorId,
    isError: isAuthorIdError,
  } = useQuery({
    queryKey: ["authorId"],
    queryFn: async () => {
      const response = await api.get<{ authorId: string }>("/publications/id");
      return response.data.authorId;
    },
    onError: (e) => {
      setErrorMessage(
        isAxiosError(e)
          ? (e.response?.data as string)
          : "An error occurred while fetching author ID."
      );
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: publicationsData,
    isLoading: isLoadingPubs,
    isError: isPubsError,
  } = useQuery({
    queryKey: ["publications", authorId],
    queryFn: async () => {
      if (!authorId) throw new Error("No authorId");
      const response = await api.get<PublicationResponse>(
        "/publications/user",
        {
          params: { authorId },
        }
      );
      return response.data;
    },
    enabled: !!authorId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col items-start gap-6 p-8">
      {isAuthorIdError || isPubsError ? (
        <p className="text-destructive">
          {errorMessage ?? "An error occurred while fetching publications"}
        </p>
      ) : isLoadingAuthorId || isLoadingPubs ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1 className="text-3xl font-bold text-primary">My Publications</h1>
          <div className="space-y-6">
            {publicationsData?.publications?.length ? (
              publicationsData.publications
                .sort((a, b) => Number(b.year) - Number(a.year))
                .map((pub, index) => {
                  const authors = pub.coAuthors
                    ?.map((a) => a.authorName)
                    .join(", ");
                  return (
                    <p
                      key={pub.citationId}
                      className="mb-4 text-justify text-base"
                    >
                      [{index + 1}] {authors && `${authors}, `}“{pub.title},”{" "}
                      <em>{pub.journal}</em>, vol. {pub.volume ?? "N/A"}, no.{" "}
                      {pub.issue ?? "N/A"}, {pub.year}.
                    </p>
                  );
                })
            ) : (
              <p>No publications found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PublicationsView;
