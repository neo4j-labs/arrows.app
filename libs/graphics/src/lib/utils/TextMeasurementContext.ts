import { FontStyle } from "../FontStyle"

export type MeasureTextFn = (s:string) => TextMetrics

export interface TextMeasurementContext {
  measureText: MeasureTextFn
  font: FontStyle
}