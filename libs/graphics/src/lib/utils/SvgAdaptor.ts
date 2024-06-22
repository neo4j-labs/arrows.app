import { Coordinate, Point } from '@neo4j-arrows/model';
import { ImageInfo, dataUrlToString } from './ImageCache';
import { FontStyle } from '../FontStyle';
import { DrawingContext } from './DrawingContext';

export interface Frame {
  textBaseline: CanvasTextBaseline;
  container: SVGElement;
  attributes: Record<string, any>; // ABK: yuck
  transforms: string[];
}

export class SvgAdaptor implements DrawingContext {
  rootElement: SVGElement;
  stack: Frame[];
  measureTextContext: CanvasRenderingContext2D;
  currentPath: string[];
  currentPoint: Point;
  globalStyle: SVGElement;

  constructor(width: number, height: number) {
    this.currentPath = [];
    this.currentPoint = new Point(0, 0);

    this.rootElement = newElement('svg', {
      width: width.toString(), // ABK: Be explicit, even though Element.setAtrribute() accepts non-string values
      height: height.toString(),
      viewBox: [0, 0, width, height].join(' '),
    });
    this.stack = [
      {
        container: this.rootElement,
        attributes: {},
        transforms: [],
        textBaseline: 'alphabetic',
      },
    ];
    // const defs = newElement('defs', {}, this.globalStyle) // ABK: placeholder for some planned functionality?
    const defs = newElement('defs', {});
    this.rootElement.appendChild(defs);
    this.globalStyle = newElement('style', {
      type: 'text/css',
    });
    defs.appendChild(this.globalStyle);
    this.pushChild(defs);
    const canvas = window.document.createElement('canvas');
    this.measureTextContext = canvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D; // ABK: should never be null, right?
    this.beginPath();
  }

  // ABK: not-implemented and conflicts with `this.globalStyle` element
  // globalStyle(arg0: string, arg1: {}, globalStyle: any) {
  //   throw new Error("Method not implemented.");
  // }

  current() {
    return this.stack[0];
  }

  filteredAttributes(keys: string[]) {
    const result: Record<string, string> = {};
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

  save(className: string) {
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
      textBaseline: 'alphabetic',
    });
  }

  restore() {
    const frame = this.stack.shift();
    if (frame && frame.container.childNodes.length === 0) {
      this.current().container.removeChild(frame.container);
    }
  }

  pushChild(child: Element) {
    const frame = this.current();
    if (frame.container.childNodes.length === 0) {
      pushStateToContainer(frame);
    }
    if (frame.transforms.length > 0) {
      child.setAttribute('transform', frame.transforms.join(' '));
    }
    frame.container.appendChild(child);
  }

  translate(dx: number, dy: number) {
    this.current().transforms.push(`translate(${dx} ${dy})`);
  }

  scale(x: number) {
    this.current().transforms.push(`scale(${x})`);
  }

  rotate(angle: number) {
    this.current().transforms.push(`rotate(${(angle * 180) / Math.PI})`);
  }

  beginPath() {
    this.currentPath = [];
    this.currentPoint = new Point(0, 0);
  }

  closePath() {
    // this.ctx.closePath()
  }

  moveTo(x: number, y: number) {
    this.currentPath.push(['M', x, y].join(' '));
    this.currentPoint = new Point(x, y);
  }

  lineTo(x: number, y: number) {
    this.currentPath.push(['L', x, y].join(' '));
    this.currentPoint = new Point(x, y);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
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

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise: boolean
  ) {
    // this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  }

  circle(cx: number, cy: number, r: number, fill: boolean, stroke: boolean) {
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

  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
    fill: boolean,
    stroke: boolean
  ) {
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

  image(
    imageInfo: ImageInfo,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.pushChild(
      newElement('image', {
        href: dataUrlToString(imageInfo.dataUrl),
        x,
        y,
        width,
        height,
      })
    );
  }

  imageInCircle(imageInfo: ImageInfo, cx: number, cy: number, radius: number) {
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
      cx: '.5',
      cy: '.5',
      r: '.5',
    });
    clipPath.appendChild(clipCircle);
    this.pushChild(clipPath);
    this.pushChild(
      newElement('image', {
        href: dataUrlToString(imageInfo.dataUrl),
        x: cx - width / 2,
        y: cy - height / 2,
        width,
        height,
        'clip-path': 'url(#myClip)',
      })
    );
  }

  polyLine(points: Coordinate[]) {
    this.pushChild(
      newElement('polyline', {
        points: points.map((point) => `${point.x},${point.y}`).join(' '),
        fill: 'none',
        ...this.filteredAttributes(['stroke', 'stroke-width']),
      })
    );
  }

  polygon(points: Coordinate[], fill: boolean, stroke: boolean) {
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

  fillText(text: string, x: number, y: number) {
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

  measureText(text: string) {
    return this.measureTextContext.measureText(text);
  }

  setLineDash(dash: number[]) {
    // this.ctx.setLineDash(dash)
  }

  appendCssText(cssText: string) {
    this.globalStyle.appendChild(document.createTextNode(cssText + '\n\n'));
  }

  set fillStyle(color: string | CanvasGradient | CanvasPattern) {
    this.current().attributes['fill'] = color;
  }

  set strokeStyle(color: string | CanvasGradient | CanvasPattern) {
    this.current().attributes['stroke'] = color;
  }

  set lineWidth(value: number) {
    this.current().attributes['stroke-width'] = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set lineJoin(value: CanvasLineJoin) {
    // ABK no-op?
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  set lineCap(value: CanvasLineCap) {
    // ABK no-op?
  }

  set font(style: FontStyle) {
    this.current().attributes['font-family'] = style.fontFamily;
    this.current().attributes['font-size'] = style.fontSize;
    this.current().attributes['font-weight'] = style.fontWeight;
    this.measureTextContext.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
  }

  set textBaseline(value: CanvasTextBaseline) {
    this.current().textBaseline = value;
  }

  set textAlign(value: CanvasTextAlign) {
    this.current().attributes['text-anchor'] =
      value === 'center' ? 'middle' : value;
  }
}

const newElement = (
  tagName: string,
  attributes: Record<string, string | number> = {}
) => {
  const element = document.createElementNS(
    'http://www.w3.org/2000/svg',
    tagName
  );
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value.toString());
  }
  return element;
};

const pushStateToContainer = (frame: Frame) => {
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
