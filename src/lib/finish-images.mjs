// The portrait masters contain the entire machine with a small transparent margin.
const widths = [800, 1600, 3200, 6400]

export function deviceSourceWidth(cssWidth, pixelRatio = 1) {
  const wanted = Math.ceil(cssWidth * pixelRatio)
  return widths.find(width => width >= wanted) ?? widths[widths.length - 1]
}
