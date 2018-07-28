const mouse = (state = { dragType: 'NONE' }, action) => {
  switch (action.type) {
    case 'MOUSE_DOWN_ON_NODE': {
      const mouseToNodeVector = action.node.position.vectorFrom(action.graphPosition)
      console.log('mouseToCenterVector', mouseToNodeVector)
      return {
        dragType: 'NODE',
        node: action.node,
        mousePosition: action.position,
        mouseToNodeVector
      }
    }

    case 'MOUSE_DOWN_ON_NODE_RING': {
      return {
        dragType: 'NODE_RING',
        node: action.node,
        mousePosition: action.position
      }
    }

    case 'MOUSE_DOWN_ON_CANVAS': {
      return {
        dragType: 'CANVAS',
        mouseDownTime: action.mouseDownTime,
        dragged: false,
        mousePosition: action.canvasPosition,
        mouseDownPosition: action.graphPosition
      }
    }

    case 'MOVE_NODES':
      return {
        ...state,
        dragged: true,
        mousePosition: action.newMousePosition
      }

    case 'RING_DRAGGED':
      return {
        ...state,
        dragged: true,
        mousePosition: action.newMousePosition
      }

    case 'SET_MARQUEE':
      return {
        ...state,
        dragType: 'MARQUEE',
        dragged: true,
        mousePosition: action.newMousePosition
      }

    case 'PAN':
      return {
        ...state,
        dragType: 'PAN',
        dragged: true,
        mousePosition: action.newMousePosition
      }

    case 'END_DRAG':
      return {
        dragType: 'NONE'
      }

    default:
      return state
  }
}

export default mouse