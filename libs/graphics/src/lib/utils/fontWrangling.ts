import { UnicodeRange } from '@japont/unicode-range'
import {googleFonts} from "@neo4j-arrows/model";

export const isCSSStyleRule = (o:unknown):o is CSSStyleRule => 
  (o !== null) && (typeof o === 'object') && Object.hasOwn(o, 'style')

export const assembleGoogleFontFacesCssWithEmbeddedFontData = (fontFamily:string, graphCodePoints:Set<number>) => {
  if (googleFonts.some(font => font.fontFamily === fontFamily)) {
    return fetch(googleFontCss(fontFamily))
      .then(response => response.text())
      .then(text => {
        const cssDocument = document.implementation.createHTMLDocument()
        const styleElement = document.createElement('style')
        styleElement.textContent = text
        cssDocument.body.appendChild(styleElement)
        const neededFontFaces = []
        if (styleElement.sheet !== null) {
          for (let i=0; i < styleElement.sheet.cssRules.length; i++) {
            const cssRule = styleElement.sheet.cssRules.item(i);
            if (isCSSStyleRule(cssRule)) {
              const fontCodePoints = UnicodeRange.parse(cssRule.style.getPropertyValue('unicode-range').split(', '))
              const fontNeeded = Array.from(graphCodePoints)
                .some(codePoint => fontCodePoints.includes(codePoint))
              if (fontNeeded) {
                neededFontFaces.push(cssRule)
              }
            }
          }
        }
        return Promise.all(neededFontFaces.map(cssRule => fetchFontCssText(cssRule)))
      })
      .catch(e => {
        console.log(e)
        return [] as string[]
      })
  } else {
    return Promise.resolve([] as string[])
  }
}

export const extractURL = (s:string) => {
  const found = s.match('url\\("([^"]*)"')
  return (found !== null) ?
    found[1]
    : null
}

export const fetchFontCssText = (cssRule:CSSStyleRule) => {
  return new Promise<string>((resolve, reject) => {
    const src = cssRule.style.getPropertyValue('src')
    const fontRemoteUrl = extractURL(src) // src.match('url\\("([^"]*)"')[1]
    if (fontRemoteUrl && fontRemoteUrl.startsWith('https://')) {
      fetch(fontRemoteUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.addEventListener('load', function () {
            const fontDataUrl = reader.result
            if (fontDataUrl !== null && typeof fontDataUrl === 'string') {
              resolve(cssRule.cssText.replace(fontRemoteUrl, fontDataUrl))
            } else {
              reject(`Invalid font data loaded from ${fontRemoteUrl}`)
            }
          })
          reader.readAsDataURL(blob)
        })
        .catch(reject)
    } else {
      reject(`Invalid URL ${fontRemoteUrl} extracted from ${src}`)
    }
  })
}

export const linkToGoogleFontsCss = () => {
  for (const font of googleFonts) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = googleFontCss(font.fontFamily)
    document.head.appendChild(link)
  }
}

const googleFontCss = (fontFamily:string) => 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontFamily) + '&display=swap'