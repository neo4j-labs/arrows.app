import {Vector} from "../model/Vector";
import {Point} from "../model/Point";

export const StateIdle = 'idle'
export const StatePressed = 'pressed'
export const StateDragging = 'dragging'

const DragThreshold = 3

export default class DragStateMachine {
  constructor () {
    this.state = StateIdle
    this.delta = new Vector(0, 0)
  }

  update (evt) {
    let eventPosition = new Point(evt.clientX, evt.clientY);
    switch (this.state) {
      case StateIdle:
        this.startPosition = eventPosition
        this.state = StatePressed
        break

      case StatePressed:
        let movementDelta = eventPosition.vectorFrom(this.startPosition)

        if (movementDelta.distance() >= DragThreshold) {
          this.delta = movementDelta
          this.state = StateDragging
        }
        break

      case StateDragging:
        this.delta = eventPosition.vectorFrom(this.previousPosition)
        break

      default:
        throw new Error('Unexpected state: ' + this.state)
    }

    this.previousPosition = eventPosition
  }

  reset () {
    this.state = StateIdle
    this.delta = new Vector(0, 0)
  }
}
