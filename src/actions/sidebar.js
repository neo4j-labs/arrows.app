export const EDIT_NODE = 'EDIT_NODE'
export const COLLAPSE_SIDEBAR = 'COLLAPSE_SIDEBAR'

export const editNode = (node) => ({
  type: EDIT_NODE,
  node
})

export const hideSidebar = () => ({
  type: COLLAPSE_SIDEBAR
})