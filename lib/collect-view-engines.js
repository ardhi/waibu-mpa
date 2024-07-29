import ViewEngine from './class/view-engine.js'

async function collectViewEngines (ctx) {
  const { eachPlugins, importModule, join } = this.app.bajo
  const { isFunction, omit, isArray } = this.app.bajo.lib._
  this.viewEngines = []
  this.log.debug('Collect view engines')
  const me = this
  await eachPlugins(async function ({ file, ns }) {
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      const ve = new ViewEngine(this, m.name, m.fileExts)
      Object.assign(ve, omit(m, ['name', 'fileExts']))
      me.viewEngines.push(ve)
      me.log.trace('- %s@%s (%s)', ve.name, ns, join(ve.fileExts))
    }
  }, { glob: 'view-engine.js', baseNs: this.name })
}

export default collectViewEngines
