const singelCenterLineFactor = 0.98
const singelCenterSiblingFactor = 0.89 // 91 if no line height adjustment
const singelCenterCousinFactor = 0.65 // 69 if no line height adjustment

const twinCenterFactor = 0.95
const twinCenterSiblingFactor = 0.78

export const hyphenChar = '‐'
export const ellipsiseChar = '…'

const getAvailbleWidthPerLine = function (line, nofLines, maxWidth) {
  // Odd number of lines
  const lineWidthSingelCenterLine = singelCenterLineFactor * maxWidth
  const lineWidthSingelCenterSibling = singelCenterSiblingFactor * maxWidth
  const lineWidthSingelCenterCousin = singelCenterCousinFactor * maxWidth

  // Even number of lines
  const lineWidthTwinCenter = twinCenterFactor * maxWidth
  const lineWidthTwinCenterSibling = twinCenterSiblingFactor * maxWidth

  if (nofLines === 1) {
    return lineWidthSingelCenterLine
  }
  if (nofLines === 2) {
    return lineWidthTwinCenter
  }
  if (nofLines === 3) {
    if (line === 0 || line === 2) {
      return lineWidthSingelCenterSibling
    } else {
      return lineWidthSingelCenterLine
    }
  }
  if (nofLines === 4) {
    if (line === 0 || line === 3) {
      return lineWidthTwinCenterSibling
    } else {
      // 1 or 2
      return lineWidthTwinCenter
    }
  }
  if (nofLines === 5) {
    if (line === 0 || line === 4) {
      return lineWidthSingelCenterCousin
    }
    if (line === 1 || line === 3) {
      return lineWidthSingelCenterSibling
    }

    // line === 2
    return lineWidthTwinCenter
  }
}

const getLookbackCnt = (txt) => {
  const lookbackChars = 3
  const textLength = txt.length
  const maxCharsToCountBack = Math.min(textLength - 1, lookbackChars)

  // If there is only one character on the line, going back is no point
  // It's a odd case but the function should handle it
  if (textLength === 1) {
    return {hyphen: false, cnt: 0}
  }

  for (let i = 0; i < maxCharsToCountBack; i++) {
    let char = txt[txt.length - (i + 1)]

    // If we hit a blank space or a non letter (including number) make that a break - but no hyphen in that case
    if (char === ' ' || (char.toLowerCase() === char.toUpperCase())) {
      return {hyphen: false, cnt: i + 1}
    }

    // If there is a camelCase separation that ends here treat that similarly to a word break and don't add hyphen
    let shortTxt = txt.slice(0, txt.length - i)
    if (isCamelCaseEnd(shortTxt)) {
      return {hyphen: false, cnt: i + 1}
    }
  }

  // If there are no natural break point than just break one step back and add a hyphen
  return {hyphen: true, cnt: 1}
}

const isUpperCase = (char) => {
  if (!char || !isNaN(char * 1) || (char.toLowerCase() === char.toUpperCase())) return false
  return (char === char.toUpperCase())
}

const isCamelCaseEnd = (txt) => {
  let char = txt[txt.length - 1]
  let prevChar = txt[txt.length - 2]
  if (!char || !isNaN(char * 1) || (char.toLowerCase() === char.toUpperCase())) return false
  if (!prevChar || !isNaN(prevChar * 1) || (prevChar.toLowerCase() === prevChar.toUpperCase())) return false
  return isUpperCase(char) && !isUpperCase(prevChar)
}

const isWhiteSpace = char => ' \t\n\r\v'.includes(char)
const isNewLine = char => '\n\r\v'.includes(char)
/**
 * This is the main function that tries to fit a text on one or more lines
 *
 * @param {string} text = The full string to place
 * @param {function} measureWidth - a function that returns the width of a string as pixels on the canvas
 * @param {function} getAvailbleWidth - A function providing the pixel width for a line index
 * @param {number} numberOfLines - How many lines is availble for this placement
 * @param {boolean} allowedToGiveUp - If cannot fit on last avilble line - should we give up or place as much as we can
 *
 * @return  array of text lines
 */
const tryWithNumberOfLines = (text, measureWidth, getAvailableWidth, numberOfLines, allowedToGiveUp = false) => {
  const availbleWidths = []
  const testLines = []
  let consumedNbrChars = 0
  let lineIndex = 0

  // Fetch availble width for this configuration
  for (let i = 0; i < numberOfLines; i++) {
    availbleWidths[i] = getAvailableWidth(i, numberOfLines)
  }

  let textForThisLine

  // Populate line after line
  for (let i = 1; i <= text.length; i++) {
    textForThisLine = text.slice(consumedNbrChars, i)
    let widthOfLine = measureWidth(textForThisLine)
    const availbleWidth = availbleWidths[lineIndex]

    // When we passed the end of the line evaluate line break
    if (widthOfLine > availbleWidth || isNewLine(text[i - 1])) {
      // If this is not the last line fill in and continue
      if (lineIndex < numberOfLines - 1) {
        let lineBreakInfo = getLookbackCnt(textForThisLine)
        let lineBreakPosition = i - lineBreakInfo.cnt

        if (lineBreakInfo.hyphen) {
          textForThisLine = text.slice(consumedNbrChars, lineBreakPosition) + hyphenChar
          widthOfLine = measureWidth(textForThisLine)

          while (widthOfLine > availbleWidth) {
            if (lineBreakPosition - consumedNbrChars > 1) {
              lineBreakPosition--
              textForThisLine = text.slice(consumedNbrChars, lineBreakPosition) + hyphenChar
              widthOfLine = measureWidth(textForThisLine)
            } else {
              // If we cannot shave more ( one char and the hyphen was too much)
              // scrap the hyphen and make it one char
              textForThisLine = text[consumedNbrChars]
              lineBreakPosition = consumedNbrChars + 1
              widthOfLine = measureWidth(textForThisLine)
              break
            }
          }
        } else {
          textForThisLine = text.slice(consumedNbrChars, lineBreakPosition)
          textForThisLine = textForThisLine.trim()
        }

        testLines[lineIndex] = textForThisLine
        consumedNbrChars = lineBreakPosition

        // Swallow white space in the end
        while (isWhiteSpace(text[consumedNbrChars])) {
          consumedNbrChars++
        }

        lineIndex++
      } else {
        // If there actually are more lines to use - bail and start over
        if (allowedToGiveUp) {
          return false
        }

        let lineBreakPosition = i
        const lastCharOfLine = () => text[lineBreakPosition - 1]

        // In edge cases with really narrow widths we need to bail
        // and only print the ellipses for the last line - obviously no point
        // in going below zero length string
        while (widthOfLine > availbleWidth) {
          lineBreakPosition--

          while (isWhiteSpace(lastCharOfLine())) {
            lineBreakPosition--
          }

          if (lineBreakPosition - consumedNbrChars > 1) {
            textForThisLine = text.slice(consumedNbrChars, lineBreakPosition) + ellipsiseChar
            widthOfLine = measureWidth(textForThisLine)
          } else {
            // If we cannot shave more, just make the last line a single ellipsise and leave
            textForThisLine = ellipsiseChar
            break
          }
        }

        testLines[lineIndex] = textForThisLine
        return testLines
      }
    }
  }
  // Coming here means that the last line wasn't filled
  textForThisLine = text.slice(consumedNbrChars, text.length)
  testLines[lineIndex] = textForThisLine
  return testLines
}

/**
 * This functions tries to fit the text in a given number of lines and only linebreak on whitespace
 *
 * @param {string} text = The full string to place
 * @param {function} measureWidth - a function that returns the width of a string as pixels on the canvas
 * @param {function} getAvailbleWidth - A function providing the pixel width for a line index
 * @param {number} numberOfLines - How many lines is availble for this placement
 *
 * @return  array of text lines
 */
const tryBreakingOnSpaces = (text, measureWidth, getAvailableWidth, numberOfLines) => {
  const tokens = text.split(/\s/g)
    .filter(token => token.length > 0)
  let lines = []
  let currentLine = null

  const didOverflow = text => measureWidth(text) > getAvailableWidth(lines.length, numberOfLines)

  for (let token of tokens) {
    const nextLine = currentLine ? currentLine + ' ' + token : token

    if (measureWidth(nextLine) < getAvailableWidth(lines.length, numberOfLines)) {
      currentLine = nextLine
    } else {
      // If currentLine is too long, we have a single word that is too long to fit on one line => give up
      if (currentLine) {
        lines.push({ text: currentLine, overflowed: didOverflow(currentLine) })
      }

      currentLine = token
      if (lines.length > numberOfLines) {
        return null
      }
    }
  }

  if (currentLine) {
    lines.push({ text: currentLine, overflowed: didOverflow(currentLine) })
  }

  return lines.length <= numberOfLines ? lines : null
}

/*
 Node word-wrap algorithm, according to the following rules:
 - The width of the lines are matched to a circular node
 - maximum of four lines are used
 - If there is an icon on the top part of the node face then only two lines below center are used
 - camelCase strings should be treated as separate words
    - but no hyphen on new line (CamelCase without hyphen

 Nomenclature:
 This code is triggered through changing the "label" parameter of the node to an object, with the following fields:
    label = {
      value: text,
      getLines: this function
    }

 Legenda:
      lookbackChars = the amount of characters to look back at for white space or camelCase word splitting points
 */

/**
 * @param {object} ctx = Canvas.2dContext
 * @param {object} text - The text to display
 * @param {object} optionCb - Callback to query for options
 *
 * @return  array of text lines
 */
export const getLines = (ctx, text, fontFace, fontSize, maxWidth, hasIcon) => {
  // temporary set the font to bold to make the calculations not differ when bold is used
  ctx.font = ('bold ' + fontSize + 'px ' + fontFace).replace(/"/g, '')

  const measureWidth = (...params) => { return ctx.measureText(...params).width }

  // When there is an icon show on top only two lines can be used for text
  const maxNoLines = hasIcon ? 2 : 4
  // To place the text blow the icon fake a number of empty lines above
  const iconAdditionalLines = ['', ''] //, '']
  const emptyTopLines = hasIcon ? iconAdditionalLines.length : 0

  const getAvailableWidth = (line, nofLines) => {
    return getAvailbleWidthPerLine(line + emptyTopLines, nofLines + emptyTopLines, maxWidth)
  }

  // Start trying to fit on one line
  let numberOfLines = 1
  let lines

  // Iteratively try to fit on increasing number of lines
  while (!lines) {
    lines = tryBreakingOnSpaces(
      text,
      measureWidth,
      getAvailableWidth,
      numberOfLines
    )
    if (!lines) {
      lines = tryWithNumberOfLines(
        text,
        measureWidth,
        getAvailableWidth,
        numberOfLines,
        maxNoLines > numberOfLines
      )
    } else {
      if (lines.some(line => line.overflowed)) {
        lines = lines.reduce((newLines, line) => {
          const remainingLines = maxNoLines - newLines.length
          if (remainingLines === 0) {
            const lastLine = newLines[newLines.length - 1]
            if (!lastLine.endsWith('…')) {
              if (measureWidth(lastLine) + measureWidth('…') > getAvailableWidth(newLines.length, numberOfLines)) {
                newLines[newLines.length - 1] = lastLine.slice(0, -2) + '…'
              } else {
                newLines[newLines.length - 1] = lastLine + '…'
              }
            }
            return newLines
          }
          if (line.overflowed === false) {
            newLines.push(line.text)
          } else {
            const hyphenatedLines = tryWithNumberOfLines(
              line.text,
              measureWidth,
              getAvailableWidth,
              remainingLines
            )

            newLines = newLines.concat(hyphenatedLines)
          }
          return newLines
        }, [])
      } else {
        lines = lines.map(line => line.text)
      }
    }

    numberOfLines++
  }

  // This is a bit hacky
  // - but solve the vertical centering by adding empty lines above the icon
  if (hasIcon) {
    if (lines.length === 1) {
      lines = lines.concat([''])
    }
    lines = iconAdditionalLines.concat(lines)
  }

  return lines
}
