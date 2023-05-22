import { MeasureTextFn } from "./TextMeasurementContext";

// ABK: this is a duplicate/variant of TextLine from circleWordWrap.ts
export interface TextLine {
  index: number
  text?: string
}

// ABK: another duplicate/variant from circleWordWrap
export interface TextLayout {
  // availableLines: number;
  // startingLine: number;
  lines: TextLine[];
  // emptyLinesBelow: number;
  // wordsRemaining: number;
}

// ABK: similar to `MeasureTextFn` but with a different return type. 
export type MeasureWidthFn = (s:string) => number

export const fitTextToRectangle = (text:string, maxWidth:number, measureWidth:MeasureWidthFn) => {

  const words = text.split(' ');
  const lines = [] as TextLine[];
  const newLine = ():TextLine => ({
    index: lines.length
  });
  let currentLine = newLine();
  const pushCurrentLineUnlessEmpty = () => {
    if (Object.hasOwn(currentLine, 'text')) {
      lines.push(currentLine);
    }
  };
  const currentLineWithExtraWord = (word:string) => {
    if (currentLine.text) {
      return currentLine.text + ' ' + word;
    } else {
      return word;
    }
  };

  while (words.length > 0) {
    if (currentLine.text && measureWidth(currentLineWithExtraWord(words[0])) > maxWidth) {
      pushCurrentLineUnlessEmpty();
      currentLine = newLine();
    } else {
      currentLine.text = currentLineWithExtraWord(words.shift() as string); // ABK: `words.length > 0` so this should be safe
    }
  }
  if (words.length === 0) {
    pushCurrentLineUnlessEmpty();
  }
  const basicLayout:TextLayout = {
    lines
  }

  const spacePerLine = (line:TextLine) => {
    return maxWidth - measureWidth(line.text || '')
  }
  const biggestGap = (layout:TextLayout) => Math.max(...layout.lines.map(spacePerLine));

  const layoutWithSwappedLines = (layout:TextLayout):TextLayout | undefined => {
    const gappyLines = layout.lines.sort((a, b) => spacePerLine(b) - spacePerLine(a))
    const mostGappy = gappyLines[0]
    const lineAbove = layout.lines.filter(line => line.index === mostGappy.index - 1)[0]
    if (lineAbove) {
      const wordsAbove = lineAbove.text!.split(' ')
      const lastWord = wordsAbove[wordsAbove.length - 1]
      const newLineAbove = {...lineAbove, text: wordsAbove.slice(0, -1).join(' ')}
      const newGappyLine = {...mostGappy, text: lastWord + ' ' + mostGappy.text}
      if (spacePerLine(newGappyLine) > 0) {
        return ({...layout, lines: layout.lines.map(line => {
          if (line.index === newLineAbove.index) {
            return newLineAbove
          } else if (line.index === newGappyLine.index) {
            return newGappyLine
          } else {
            return line
          }
        })})
      } 
    } 

    return undefined // ABK ick. 
  }

  const moreLayouts = (() => {
    const layouts = []
    let currentLayout: TextLayout | undefined = basicLayout
    while (currentLayout) {
      layouts.push(currentLayout)
      currentLayout = layoutWithSwappedLines(currentLayout)
    }
    return layouts
  })()

  const bestLayout = moreLayouts.slice(0).sort((a, b) => biggestGap(a) - biggestGap(b))[0]

  return {
    actualWidth: Math.max(...bestLayout.lines.map(line => measureWidth(line.text || ''))),
    margin: measureWidth(' '),
    lines: bestLayout.lines.sort((a, b) => a.index - b.index).map(line => line.text)
  }
}
