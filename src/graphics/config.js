export default {
  hoverWidth: 0,
  selectionWidth: 0.5,
  width: 1,
  labelHighlightBold: false,
  labelSelectedBold: true,
  arrowStrikethrough: true,
  smooth: {
    type: 'neo',
    roundness: 0.5
  },
  font: {
    size: 6,
    strokeWidth: 0,
    align: 'top',
    vadjust: 2
  },
  color: {
    inherit: false,
    fill: '#000000'
  },
  arrows: {
    to: {
      type: 'arrow',
      scaleFactor: 1
    },
    from: {
      type: 'none',
      scaleFactor: 1
    }
  },
  edgeTypePlugin: {
    arrows: {
      to: {
        gap: 1,
        type: 'arrow',
        scaleFactor: 1
      },
      from: {
        gap: 1,
        type: 'none',
        scaleFactor: 1
      }
    },
    color: {
      outlineSelected: 'white',
      outline: '#f8f9fb'
    },
    renderLayer: 'foreground',
    outlineWidth: 1,
    shadowSelected: {
      enabled: true,
      color: '#bbb',
      size: 18,
      x: 0,
      y: 0
    },
    font: {
      size: 7
    },
    selfReferringLength: 70,
    selfReferringAngle: 20,
    bundleSpacing: 10
  }
}