import phosphor from './iconset/phosphor.js'
import phosphorDuotone from './iconset/phosphor-duotone.js'
import phosphorFill from './iconset/phosphor-fill.js'

async function iconset (ctx) {
  return [
    phosphor.call(this, ctx),
    phosphorFill.call(this, ctx),
    phosphorDuotone.call(this, ctx)
  ]
}

export default iconset
