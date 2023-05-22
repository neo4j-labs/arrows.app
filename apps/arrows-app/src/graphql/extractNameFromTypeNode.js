/**
 * @param {import("graphql").TypeNode} typeNode
 */
function extractNameFromTypeNode(typeNode) {
  if (["ListType", "NonNullType"].includes(typeNode.kind)) {
    return extractNameFromTypeNode(typeNode.type);
  }
  return typeNode.name.value;
}

export default extractNameFromTypeNode;
