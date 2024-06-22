class NodePair {
  constructor(node1, node2, start, end) {
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

const attachKey = (attach) => {
  if (attach) {
    return attach.attachment.name;
  }
  return 'normal';
};

export const bundle = (relationships) => {
  const bundles = {};
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
