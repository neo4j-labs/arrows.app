import {ViewTransformation} from "@neo4j-arrows/model"

export interface DisplayOptions {
  viewTransformation: ViewTransformation
  canvasSize: {
    width: number
    height: number
  }
}
