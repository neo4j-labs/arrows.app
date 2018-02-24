export const EDIT_NODE = 'EDIT_NODE'
export const COLLAPSE_SIDEBAR = 'COLLAPSE_SIDEBAR'

export const editNode = (nodeId) => ({
  type: EDIT_NODE,
  nodeId
})

export const hideSidebar = () => ({
  type: COLLAPSE_SIDEBAR
})