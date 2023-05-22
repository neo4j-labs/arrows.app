export class Size {
  constructor(readonly width:number, readonly height:number) {}

  relative(dWidth:number, dHeight:number) {
    return new Size(this.width + dWidth, this.height + dHeight)
  }
}
