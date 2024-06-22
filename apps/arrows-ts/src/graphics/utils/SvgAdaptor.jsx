import { Point } from '../../model/Point';
export default class SvgAdaptor {
  constructor(width, height) {
    this.rootElement = newElement('svg', {
      width,
      height,
      viewBox: [0, 0, width, height].join(' '),
    });
    this.stack = [
      {
        container: this.rootElement,
        attributes: {},
        transforms: [],
      },
    ];
    const defs = newElement('defs', {}, this.globalStyle);
    this.rootElement.appendChild(defs);
    this.globalStyle = newElement('style', {
      type: 'text/css',
    });
    defs.appendChild(this.globalStyle);
    this.pushChild(defs);
    const canvas = window.document.createElement('canvas');
    this.measureTextContext = canvas.getContext('2d');
    this.beginPath();
  }

  current() {
    return this.stack[0];
  }

  filteredAttributes(keys) {
    const result = {};
    const frame = this.current();
    if (frame.container.childNodes.length === 0) {
      return {};
    }
    for (const [key, value] of Object.entries(frame.attributes)) {
      if (keys.includes(key)) {
        result[key] = value;
      }
    }
    return result;
  }

  save(className) {
    const frame = this.current();
    if (frame.container.childNodes.length === 0) {
      pushStateToContainer(frame);
    }
    const g = newElement('g');
    if (className) {
      g.setAttribute('class', className);
    }
    frame.container.appendChild(g);
    this.stack.unshift({
      container: g,
      attributes: { ...frame.attributes },
      transforms: [...frame.transforms],
    });
  }

  restore() {
    const frame = this.stack.shift();
    if (frame.container.childNodes.length === 0) {
      this.current().container.removeChild(frame.container);
    }
  }

  pushChild(child) {
    const frame = this.current();
    if (frame.container.childNodes.length === 0) {
      pushStateToContainer(frame);
    }
    if (frame.transforms.length > 0) {
      child.setAttribute('transform', frame.transforms.join(' '));
    }
    frame.container.appendChild(child);
  }

  translate(dx, dy) {
    this.current().transforms.push(`translate(${dx} ${dy})`);
  }

  scale(x) {
    this.current().transforms.push(`scale(${x})`);
  }

  rotate(angle) {
    this.current().transforms.push(`rotate(${(angle * 180) / Math.PI})`);
  }

  beginPath() {
    this.currentPath = [];
    this.currentPoint = new Point(0, 0);
  }

  closePath() {
    // this.ctx.closePath()
  }

  moveTo(x, y) {
    this.currentPath.push(['M', x, y].join(' '));
    this.currentPoint = new Point(x, y);
  }

  lineTo(x, y) {
    this.currentPath.push(['L', x, y].join(' '));
    this.currentPoint = new Point(x, y);
  }

  arcTo(x1, y1, x2, y2, radius) {
    const controlPoint = new Point(x1, y1);
    const controlFromCurrent = controlPoint.vectorFrom(this.currentPoint);
    const destination = new Point(x2, y2);
    const destinationFromControl = destination.vectorFrom(controlPoint);
    const deflection =
      controlFromCurrent.angle() - destinationFromControl.angle();
    const indent = radius * Math.abs(Math.tan(deflection / 2));
    const point1 = controlPoint.translate(
      controlFromCurrent.scale(-indent / controlFromCurrent.distance())
    );
    const point2 = controlPoint.translate(
      destinationFromControl.scale(indent / destinationFromControl.distance())
    );
    this.currentPath.push(['L', ...point1.xy].join(' '));
    this.currentPath.push(
      ['A', radius, radius, 0, 0, deflection > 0 ? 0 : 1, ...point2.xy].join(
        ' '
      )
    );
    this.currentPath.push(['L', ...destination.xy].join(' '));
    this.currentPoint = destination;
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    // this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  }

  circle(cx, cy, r, fill, stroke) {
    const circle = newElement('circle', {
      cx,
      cy,
      r,
      ...this.filteredAttributes(['fill', 'stroke', 'stroke-width']),
    });
    if (!fill) circle.setAttribute('fill', 'none');
    if (!stroke) circle.setAttribute('stroke', 'none');
    this.pushChild(circle);
  }

  rect(x, y, width, height, r, fill, stroke) {
    const rect = newElement('rect', {
      x,
      y,
      width,
      height,
      rx: r,
      ry: r,
      ...this.filteredAttributes(['fill', 'stroke']),
    });
    this.pushChild(rect);
    if (!fill) rect.setAttribute('fill', 'none');
    if (!stroke) rect.setAttribute('stroke', 'none');
  }

  image(imageInfo, x, y, width, height) {
    this.pushChild(
      newElement('image', {
        href: imageInfo.dataUrl,
        x,
        y,
        width,
        height,
      })
    );
  }

  imageInCircle(imageInfo, cx, cy, radius) {
    // <clipPath id="myClip" clipPathUnits="objectBoundingBox">
    //   <circle cx=".5" cy=".5" r=".5" />
    // </clipPath>
    const ratio = imageInfo.width / imageInfo.height;
    const { width, height } =
      imageInfo.width > imageInfo.height
        ? {
            width: 2 * radius * ratio,
            height: 2 * radius,
          }
        : {
            width: 2 * radius,
            height: (2 * radius) / ratio,
          };

    const clipPath = newElement('clipPath', {
      id: 'myClip',
      clipPathUnits: 'objectBoundingBox',
    });
    const clipCircle = newElement('circle', {
      cx: 0.5,
      cy: 0.5,
      r: 0.5,
    });
    clipPath.appendChild(clipCircle);
    this.pushChild(clipPath);
    this.pushChild(
      newElement('image', {
        href: imageInfo.dataUrl,
        x: cx - width / 2,
        y: cy - height / 2,
        width,
        height,
        'clip-path': 'url(#myClip)',
      })
    );
  }

  polyLine(points) {
    this.pushChild(
      newElement('polyline', {
        points: points.map((point) => `${point.x},${point.y}`).join(' '),
        fill: 'none',
        ...this.filteredAttributes(['stroke', 'stroke-width']),
      })
    );
  }

  polygon(points, fill, stroke) {
    const polygon = newElement('polygon', {
      points: points.map((point) => `${point.x},${point.y}`).join(' '),
      ...this.filteredAttributes(['fill', 'stroke']),
    });
    this.pushChild(polygon);
    if (!fill) polygon.setAttribute('fill', 'none');
    if (!stroke) polygon.setAttribute('stroke', 'none');
  }

  stroke() {
    if (this.currentPath) {
      this.pushChild(
        newElement('path', {
          d: this.currentPath.join(' '),
          ...this.filteredAttributes(['fill', 'stroke', 'stroke-width']),
        })
      );
    }
  }

  fill() {
    // this.ctx.fill()
  }

  fillText(text, x, y) {
    const oMetrics = this.measureText('o');
    const middleHeight =
      (oMetrics.actualBoundingBoxAscent + oMetrics.actualBoundingBoxDescent) /
      2;
    const textElement = newElement('text', {
      'xml:space': 'preserve',
      x,
      y: this.current().textBaseline === 'middle' ? y + middleHeight : y,
      stroke: 'none',
      ...this.filteredAttributes([
        'font-family',
        'font-size',
        'font-weight',
        'text-anchor',
        'fill',
      ]),
    });
    textElement.appendChild(document.createTextNode(text));
    this.pushChild(textElement);
  }

  measureText(text) {
    return this.measureTextContext.measureText(text);
  }

  setLineDash(dash) {
    // this.ctx.setLineDash(dash)
  }

  appendCssText(cssText) {
    this.globalStyle.appendChild(document.createTextNode(cssText + '\n\n'));
  }

  set fillStyle(color) {
    this.current().attributes['fill'] = color;
  }

  set strokeStyle(color) {
    this.current().attributes['stroke'] = color;
  }

  set lineWidth(value) {
    this.current().attributes['stroke-width'] = value;
  }

  set lineJoin(value) {}

  set font(style) {
    this.current().attributes['font-family'] = style.fontFamily;
    this.current().attributes['font-size'] = style.fontSize;
    this.current().attributes['font-weight'] = style.fontWeight;
    this.measureTextContext.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
  }

  set textBaseline(value) {
    this.current().textBaseline = value;
  }

  set textAlign(value) {
    this.current().attributes['text-anchor'] =
      value === 'center' ? 'middle' : value;
  }
}

const newElement = (tagName, attributes = {}) => {
  const element = document.createElementNS(
    'http://www.w3.org/2000/svg',
    tagName
  );
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  return element;
};

const pushStateToContainer = (frame) => {
  if (frame.transforms.length > 0) {
    frame.container.setAttribute('transform', frame.transforms.join(' '));
    frame.transforms = [];
  }
  if (Object.keys(frame.attributes).length > 0) {
    for (const [key, value] of Object.entries(frame.attributes)) {
      frame.container.setAttribute(key, value);
    }
    frame.attributes = {};
  }
};
