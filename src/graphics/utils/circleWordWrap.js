export const fitTextToCircle = (text, radius, measureWidth, lineHeight) => {

  const sq = (n) => n * n;
  const range = (n) => {
    const array = new Array(n);
    for (let i = 0; i < n; i++) {
      array[i] = i;
    }
    return array;
  }

  const extent = (possibleLines, lineIndex) => {
    const mid = (lineIndex - (possibleLines - 1) / 2) * lineHeight
    const top = mid - lineHeight / 2
    const bottom = mid + lineHeight / 2
    const topWidth = Math.sqrt(sq(radius) - sq(top))
    const bottomWidth = Math.sqrt(sq(radius) - sq(bottom))
    const width = Math.min(topWidth, bottomWidth) * 2
    return ({top, mid, width})
  };

  const maxLines = Math.floor(radius * 2 / lineHeight);

  const linesForStaringPoint = (availableLines, startingLine) => {
    const words = text.split(' ');
    const lines = [];
    let lineIndex = startingLine;
    const newLine = () => ({
      index: lineIndex,
      extent: extent(availableLines, lineIndex)
    });
    let currentLine = newLine();
    const pushCurrentLineUnlessEmpty = () => {
      if (currentLine.text) {
        lines.push(currentLine);
      }
    };
    const currentLineWithExtraWord = (word) => {
      if (currentLine.text) {
        return currentLine.text + ' ' + word;
      } else {
        return word;
      }
    };

    while (words.length > 0) {
      if (measureWidth(currentLineWithExtraWord(words[0])) > currentLine.extent.width) {
        pushCurrentLineUnlessEmpty();
        lineIndex++;
        if (lineIndex >= availableLines) break;
        currentLine = newLine();
      } else {
        currentLine.text = currentLineWithExtraWord(words.shift());
      }
    }
    if (words.length === 0) {
      pushCurrentLineUnlessEmpty();
    }
    return {
      availableLines,
      startingLine,
      lines,
      emptyLinesBelow: availableLines - (lines.length > 0 ? lines[lines.length - 1].index : startingLine) - 1,
      wordsRemaining: words.length
    }
  }

  const possibleLayoutsA = range(Math.ceil(maxLines / 2)).map(startingLine => linesForStaringPoint(maxLines, startingLine));
  const possibleLayoutsB = range(Math.ceil((maxLines - 1) / 2)).map(startingLine => linesForStaringPoint(maxLines - 1, startingLine));
  const allPossibleLayouts = possibleLayoutsA.concat(possibleLayoutsB);

  const filterLowest = (array, accessor) => {
    const min = Math.min(...array.map(accessor));
    return array.filter(item => accessor(item) === min)
  };

  const balancedLayout = (() => {
    const mostWords = filterLowest(allPossibleLayouts, layout => layout.wordsRemaining);
    const fewestLines = filterLowest(mostWords, layout => layout.lines.length);
    const mostBalanced = filterLowest(fewestLines, layout => Math.abs(layout.startingLine - layout.emptyLinesBelow));
    return mostBalanced[0]
  })();

  const spacePerLine = (line) => {
    return line.extent.width - measureWidth(line.text)
  }
  const biggestGap = layout => Math.max(...layout.lines.map(spacePerLine));

  const layoutWithSwappedLines = (layout) => {
    const gappyLines = layout.lines.sort((a, b) => spacePerLine(b) - spacePerLine(a))
    const mostGappy = gappyLines[0]
    const lineAbove = layout.lines.filter(line => line.index === mostGappy.index - 1)[0]
    if (lineAbove) {
      const wordsAbove = lineAbove.text.split(' ')
      const lastWord = wordsAbove[wordsAbove.length - 1]
      const newLineAbove = {...lineAbove, text: wordsAbove.slice(0, -1).join(' ')}
      const newGappyLine = {...mostGappy, text: lastWord + ' ' + mostGappy.text}
      if (spacePerLine(newGappyLine) > 0) {
        return ({
          ...layout, lines: layout.lines.map(line => {
            if (line.index === newLineAbove.index) {
              return newLineAbove
            } else if (line.index === newGappyLine.index) {
              return newGappyLine
            } else {
              return line
            }
          })
        })
      }
    }
  }

  const moreLayouts = (() => {
    const layouts = []
    let currentLayout = balancedLayout
    while (currentLayout) {
      layouts.push(currentLayout)
      currentLayout = layoutWithSwappedLines(currentLayout)
    }
    return layouts
  })();

  const bestLayout = moreLayouts.slice(0).sort((a, b) => biggestGap(a) - biggestGap(b))[0]
    || ({ lines: [], wordsRemaining: Infinity })

  return {
    top: Math.min(...bestLayout.lines.map(line => line.extent.top)),
    lines: bestLayout.lines.sort((a, b) => a.index - b.index).map(line => line.text),
    allTextFits: bestLayout.wordsRemaining === 0
  }
}
