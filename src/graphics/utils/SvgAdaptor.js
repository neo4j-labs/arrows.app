export default class SvgAdaptor {
  constructor(e) {
    this.e = e
    this.stack = [
      {
        strokeColor: 'black',
        transforms: []
      }
    ]
    this.children = []
    const canvas = window.document.createElement('canvas')
    this.measureTextContext = canvas.getContext('2d')
  }

  current() {
    return this.stack[0]
  }

  save() {
    this.stack.unshift({...this.current(), transforms: [...this.current().transforms]})
  }

  restore() {
    this.stack.shift()
  }

  translate(dx, dy) {
    this.current().transforms.push(`translate(${dx} ${dy})`)
  }

  scale(x, y) {
    // this.ctx.scale(x, y)
  }

  rotate(angle) {
    // this.ctx.rotate(angle)
  }

  beginPath() {
    // this.ctx.beginPath()
  }

  closePath() {
    // this.ctx.closePath()
  }

  moveTo(x, y) {
    // this.ctx.moveTo(x, y)
  }

  lineTo(x, y) {
    // this.ctx.lineTo(x, y)
  }

  arcTo(x1, y1, x2, y2, radius) {
    // this.ctx.arcTo(x1, y1, x2, y2, radius)
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    // this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  }

  circle(cx, cy, r, fill, stroke) {
    this.children.push(this.e('circle', {
      transform: this.current().transforms.join(' '),
      cx,
      cy,
      r,
      fill: fill ? this.current().fillStyle : 'none',
      stroke: stroke ? this.current().strokeStyle : 'none'
    }))
  }

  rect(x, y, width, height, r, fill, stroke) {
    this.children.push(this.e('rect', {
      transform: this.current().transforms.join(' '),
      x,
      y,
      width,
      height,
      rx: r,
      ry: r,
      fill: fill ? this.current().fillStyle : 'none',
      stroke: stroke ? this.current().strokeStyle : 'none'
    }))
  }

  stroke() {
    // this.ctx.stroke()
  }

  fill() {
    // this.ctx.fill()
  }

  fillText(text, x, y) {
    // this.ctx.fillText(text, x, y)
  }

  measureText(text) {
    return this.measureTextContext.measureText(text)
  }

  setLineDash(dash) {
    // this.ctx.setLineDash(dash)
  }

  set fillStyle(color) {
    this.current().fillStyle = color
  }

  set font(style) {
    this.current().font = `${style.fontWeight} ${style.fontSize}px ${style.fontFace}`
  }

  set textBaseline(value) {
    this.current().textBaseline = value
  }

  set lineWidth(value) {
    this.current().lineWidth = value
  }

  set lineJoin(value) {
    this.current().lineJoin = value
  }

  set strokeStyle(value) {
    this.current().strokeStyle = value
  }

  asSvg(width, height) {
    return this.e('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        xmlnsXlink: 'http://www.w3.org/1999/xlink',
        width,
        height,
        viewBox: [0, 0, width, height].join(' ')
      },
      this.children
    )
  }
}