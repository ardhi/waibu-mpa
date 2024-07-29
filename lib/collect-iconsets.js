import Iconset from './class/iconset.js'
import loadResource from './load-resource.js'

async function collectIconsets (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { isFunction, isArray } = this.app.bajo.lib._

  this.iconsets = []
  this.log.debug('Collect iconsets')
  const me = this
  await eachPlugins(async function ({ file, ns }) {
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      m.css = await loadResource.call(this, m, 'css')
      const iconset = new Iconset(this, m)
      me.iconsets.push(iconset)
      me.log.trace('- %s@%s', iconset.name, ns)
    }
  }, { glob: 'iconset.js', baseNs: this.name })
}

export default collectIconsets
