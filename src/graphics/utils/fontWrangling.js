import { UnicodeRange } from '@japont/unicode-range'
import {fonts} from "../../model/fonts";

export const assembleGoogleFontFacesCssWithEmbeddedFontData = (fontFamily, graphCodePoints) => {
  return fetch(googleFontCss(fontFamily))
    .then(response => response.text())
    .then(text => {
      const cssDocument = document.implementation.createHTMLDocument()
      const styleElement = document.createElement('style')
      styleElement.textContent = text
      cssDocument.body.appendChild(styleElement)
      const neededFontFaces = []
      for (const cssRule of styleElement.sheet.cssRules) {
        const fontCodePoints = UnicodeRange.parse(cssRule.style['unicode-range'].split(', '))
        let fontNeeded = Array.from(graphCodePoints)
          .some(codePoint => fontCodePoints.includes(codePoint))
        if (fontNeeded) {
          neededFontFaces.push(cssRule)
        }
      }
      return Promise.all(neededFontFaces.map(cssRule => fetchFontCssText(cssRule)))
    })
}

export const fetchFontCssText = (cssRule) => {
  return new Promise((resolve, reject) => {
    const src = cssRule.style['src']
    const fontRemoteUrl = src.match('url\\("([^"]*)"')[1]
    if (fontRemoteUrl && fontRemoteUrl.startsWith('https://')) {
      fetch(fontRemoteUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.addEventListener('load', function () {
            const fontDataUrl = reader.result
            resolve(cssRule.cssText.replace(fontRemoteUrl, fontDataUrl))
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
  for (const font of fonts) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = googleFontCss(font.fontFamily)
    document.head.appendChild(link)
  }
}

const googleFontCss = (fontFamily) => 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontFamily) + '&display=swap'