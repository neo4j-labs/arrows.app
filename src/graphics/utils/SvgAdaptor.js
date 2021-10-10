import {Point} from "../../model/Point";
export default class SvgAdaptor {
  constructor() {
    this.e = (tagName, attributes, ...children) => {
      const element = document.createElementNS("http://www.w3.org/2000/svg", tagName)
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value)
      }
      for (const child of children) {
        element.appendChild(child)
      }
      return element
    }
    this.stack = [
      {
        strokeColor: 'black',
        transforms: []
      }
    ]
    this.children = []
    const defs = this.e('defs', {}, this.e('style', {
      type: 'text/css'
    }, document.createTextNode("@import url(http://fonts.googleapis.com/css?family=Caveat);")))
    this.children.push(defs)
    const canvas = window.document.createElement('canvas')
    this.measureTextContext = canvas.getContext('2d')
    this.beginPath()
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

  scale(x) {
    this.current().transforms.push(`scale(${x})`)
  }

  rotate(angle) {
    this.current().transforms.push(`rotate(${angle * 180 / Math.PI})`)
  }

  beginPath() {
    this.currentPath = []
    this.currentPoint = new Point(0, 0)
  }

  closePath() {
    // this.ctx.closePath()
  }

  moveTo(x, y) {
    this.currentPath.push(['M', x, y].join(' '))
    this.currentPoint = new Point(x, y)
  }

  lineTo(x, y) {
    this.currentPath.push(['L', x, y].join(' '))
    this.currentPoint = new Point(x, y)
  }

  arcTo(x1, y1, x2, y2, radius) {
    const controlPoint = new Point(x1, y1)
    const controlFromCurrent = controlPoint.vectorFrom(this.currentPoint)
    const destination = new Point(x2, y2)
    const destinationFromControl = destination.vectorFrom(controlPoint)
    const deflection = controlFromCurrent.angle() - destinationFromControl.angle()
    const indent = radius * Math.abs(Math.tan(deflection / 2))
    const point1 = controlPoint.translate(controlFromCurrent.scale(-indent / controlFromCurrent.distance()))
    const point2 = controlPoint.translate(destinationFromControl.scale(indent / destinationFromControl.distance()))
    this.currentPath.push(['L', ...point1.xy].join(' '))
    this.currentPath.push(['A', radius, radius, 0, 0, deflection > 0 ? 0 : 1, ...point2.xy].join(' '))
    this.currentPath.push(['L', ...destination.xy].join(' '))
    this.currentPoint = destination
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
      stroke: stroke ? this.current().strokeStyle : 'none',
      'stroke-width': this.current().lineWidth
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

  image(imageInfo, x, y, width, height) {
    this.children.push(this.e('image', {
      transform: this.current().transforms.join(' '),
      href: imageInfo.dataUrl,
      x,
      y,
      width,
      height
    }))
  }

  imageInCircle(imageInfo, cx, cy, radius) {
    // <clipPath id="myClip" clipPathUnits="objectBoundingBox">
    //   <circle cx=".5" cy=".5" r=".5" />
    // </clipPath>
    const ratio = imageInfo.width / imageInfo.height
    const {width, height} =
      (imageInfo.width > imageInfo.height) ? {
        width: 2 * radius * ratio,
        height: 2 * radius
      } : {
        width: 2 * radius,
        height: 2 * radius / ratio
      }

    const clipCircle = this.e('circle', {
      cx: .5,
      cy: .5,
      r: .5
    })
    this.children.push(this.e('clipPath', {
      id: 'myClip',
      clipPathUnits: 'objectBoundingBox'
    }, clipCircle))
    this.children.push(this.e('image', {
      transform: this.current().transforms.join(' '),
      href: imageInfo.dataUrl,
      x: cx - width / 2,
      y: cy - height / 2,
      width,
      height,
      'clip-path': 'url(#myClip)'
    }))
  }

  polyLine(points) {
    this.children.push(this.e('polyline', {
      transform: this.current().transforms.join(' '),
      points: points.map(point => `${point.x},${point.y}`).join(' '),
      fill: 'none',
      stroke: this.current().strokeStyle,
      'stroke-width': this.current().lineWidth
    }))
  }

  polygon(points, fill, stroke) {
    this.children.push(this.e('polygon', {
      transform: this.current().transforms.join(' '),
      points: points.map(point => `${point.x},${point.y}`).join(' '),
      fill: fill ? this.current().fillStyle : 'none',
      stroke: stroke ? this.current().strokeStyle : 'none',
      'stroke-width': this.current().lineWidth
    }))
  }

  stroke() {
    if (this.currentPath) {
      this.children.push(this.e('path', {
        transform: this.current().transforms.join(' '),
        d: this.currentPath.join(' '),
        fill: 'none',
        stroke: this.current().strokeStyle,
        'stroke-width': this.current().lineWidth
      }))
    }
  }

  fill() {
    // this.ctx.fill()
  }

  fillText(text, x, y) {
    const oMetrics = this.measureText('o')
    const middleHeight = (oMetrics.actualBoundingBoxAscent + oMetrics.actualBoundingBoxDescent) / 2
    this.children.push(this.e('text', {
      'xml:space': 'preserve',
      transform: this.current().transforms.join(' '),
      x,
      y: this.current().textBaseline === 'middle' ? y + middleHeight : y,
      'font-family': this.current().font.fontFamily,
      'font-size': this.current().font.fontSize,
      'font-weight': this.current().font.fontWeight,
      'text-anchor': ((a) => a === 'center' ? 'middle' : a )(this.current().textAlign),
      fill: this.current().fillStyle
    }, document.createTextNode(text)))
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
    this.current().font = style
    this.measureTextContext.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
  }

  set textBaseline(value) {
    this.current().textBaseline = value
  }

  set textAlign(value) {
    this.current().textAlign = value
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
        width,
        height,
        viewBox: [0, 0, width, height].join(' ')
      },
      ...this.children
    )
  }
}