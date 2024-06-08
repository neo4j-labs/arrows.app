export type Attribute = {
  range?: string;
  description?: string;
  multivalued?: boolean;
};

export enum SpiresCoreClasses {
  NamedEntity = 'NamedEntity',
  Triple = 'Triple',
}

export type LinkMLClass = {
  attributes?: Record<string, Attribute>;
  description?: string;
  is_a?: SpiresCoreClasses;
  slot_usage?: Record<string, Attribute>;
  tree_root?: boolean;
};

export type LinkML = {
  id: string;
  default_range?: string;
  name: string;
  prefixes: Record<string, string>;
  title: string;
  classes: Record<string, LinkMLClass>;
  imports?: string[];
};
