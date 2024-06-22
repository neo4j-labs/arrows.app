export interface MinimalAttachment {
  attachment: {
    name: string;
  };
}
/**
 * A minimal Relationship structure.
 */
export interface MinimalRelationship {
  from: {
    id: string;
  };
  to: {
    id: string;
  };
  startAttachment: MinimalAttachment;
  endAttachment: MinimalAttachment;
}

class NodePair {
  nodeA: { id: string };
  attachA: MinimalAttachment;
  nodeB: { id: string };
  attachB: MinimalAttachment;
  constructor(
    node1: { id: string },
    node2: { id: string },
    start: MinimalAttachment,
    end: MinimalAttachment
  ) {
    if (node1.id < node2.id) {
      this.nodeA = node1;
      this.attachA = start;
      this.nodeB = node2;
      this.attachB = end;
    } else {
      this.nodeA = node2;
      this.attachA = end;
      this.nodeB = node1;
      this.attachB = start;
    }
  }

  key() {
    return `${this.nodeA.id}:${this.nodeB.id}:${attachKey(
      this.attachA
    )}:${attachKey(this.attachB)}`;
  }
}

const attachKey = <A extends MinimalAttachment>(attach: A) => {
  if (attach) {
    return attach.attachment.name;
  }
  return 'normal';
};

export const bundle = <R extends MinimalRelationship>(relationships: R[]) => {
  const bundles: Record<string, R[]> = {};
  relationships.forEach((r) => {
    const nodePair = new NodePair(
      r.from,
      r.to,
      r.startAttachment,
      r.endAttachment
    );
    const bundle = bundles[nodePair.key()] || (bundles[nodePair.key()] = []);
    bundle.push(r);
  });
  return Object.values(bundles);
};
