import pure from './theme/pure.js'

async function theme (ctx) {
  return [
    pure.call(this, ctx)
  ]
}

export default theme
