export interface Publication {
    citationId: string;
    title: string;
    type: string | null;
    journal: string | null;
    volume: string | null;
    issue: string | null;
    year: string | null;
    link: string | null;
    citations: string | null;
    authorNames: string | null;
}

export interface CoAuthor {
    authorId: string;
    authorName: string | null;
}

export interface PublicationWithCoAuthors extends Publication {
    coAuthors: CoAuthor[];
}

export interface PublicationRow {
    publication: Publication;
    authorId: string;
    authorName: string | null;
}
