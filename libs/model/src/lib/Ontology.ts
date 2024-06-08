export type Ontology = {
  id: string;
  name: string;
  description: string;
  namespace: string;
};

export const ontologies: Ontology[] = [
  {
    id: 'HPO',
    name: 'Phenotype',
    description:
      'Terms representing medically relevant phenotypes and disease-phenotype annotations.',
    namespace: 'http://purl.obolibrary.org/obo/HP_',
  },
  {
    id: 'GO',
    name: 'Function, process, component',
    description:
      'Terms representing attributes of gene products in all organisms. Cellular component, molecular function, and biological process domains are covered.',
    namespace: 'http://purl.obolibrary.org/obo/GO_',
  },
  {
    id: 'Mondo',
    name: 'Disease',
    description: 'Terms representing human diseases.',
    namespace: 'http://purl.obolibrary.org/obo/MONDO_',
  },
  {
    id: 'VO',
    name: 'Vaccine',
    description: 'Terms in the domain of vaccine and vaccination.',
    namespace: 'http://purl.obolibrary.org/obo/VO_',
  },
  {
    id: 'ChEBI',
    name: 'Chemical',
    description:
      'Structured classification of molecular entities of biological interest focusing on “small” chemical compounds.',
    namespace: 'http://purl.obolibrary.org/obo/CHEBI_',
  },
  {
    id: 'Uberon',
    name: 'Tissue',
    description:
      'Terms representing body parts, organs and tissues in a variety of animal species, with a focus on vertebrates.',
    namespace: 'http://purl.obolibrary.org/obo/UBERON_',
  },
  {
    id: 'CL',
    name: 'Cell',
    description: 'Terms representing publicly available cell lines.',
    namespace: 'http://purl.obolibrary.org/obo/CL_',
  },
  {
    id: 'PR',
    name: 'Protein',
    description:
      'Terms representing protein-related entities (including specific modified forms, orthologous isoforms, and protein complexes).',
    namespace: 'http://purl.obolibrary.org/obo/PR_',
  },
  {
    id: 'SO',
    name: 'Sequence',
    description:
      'Terms representing features and properties of nucleic acid used in biological sequence annotation.',
    namespace: 'http://purl.obolibrary.org/obo/SO_',
  },
  {
    id: 'PW',
    name: 'Pathway',
    description: 'Terms for annotating gene products to pathways.',
    namespace: 'http://purl.obolibrary.org/obo/PW_',
  },
  {
    id: 'RO',
    name: 'Relation',
    description:
      'Terms and properties representing relationships used across a wide variety of biological ontologies.',
    namespace: 'http://purl.obolibrary.org/obo/RO_',
  },
  {
    id: 'HGNC',
    name: 'Gene',
    description: 'Terms and properties representing genes.',
    namespace: 'http://identifiers.org/hgnc/',
  },
];
