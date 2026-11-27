const targets = {
  'inside-one': 'inside-one', 'kiln-rear': 'kiln-rear', back: 'back',
  'one-finishes': 'one-finishes', 'one-heading': 'one-finishes',
  'one-configurations': 'one-configurations', studio: 'one-finishes',
}
export function hardwareDestination(path, hash) {
  const target = targets[hash.replace(/^#/, '')]
  return path === '/' && target ? `/products/one/#${target}` : null
}
