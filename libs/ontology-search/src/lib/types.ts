type Link = {
  href: string;
};

type Page = {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
};

type Links = {
  first: Link;
  self: Link;
  next: Link;
  last: Link;
};

type OntologyConfig = {
  id: string;
  description: string;
  title: string;
  fileLocation: string;
};

type Embedded = {
  ontologies: { config: OntologyConfig }[];
};

export type OntologiesJson = {
  _embedded: Embedded;
  links: Links;
  page: Page;
};
