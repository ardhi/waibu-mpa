import ViewEngine from './class/view-engine.js'

async function collectViewEngines (ctx) {
  const { eachPlugins, importModule, join, runHook } = this.app.bajo
  const { isFunction, omit, isArray } = this.app.lib._
  this.viewEngines = []
  this.log.debug('collect%s', 'view engines')
  const me = this
  await eachPlugins(async function ({ file }) {
    const { name: ns } = this
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      await runHook(`${me.name}.${mod.name}:beforeCollectViewEngine`, m)
      const ve = new ViewEngine(this, m.name, m.fileExts)
      Object.assign(ve, omit(m, ['name', 'fileExts']))
      me.viewEngines.push(ve)
      me.log.trace('- %s@%s (%s)', ve.name, ns, join(ve.fileExts))
      await runHook(`${me.name}.${mod.name}:afterCollectViewEngine`, ve)
    }
  }, { glob: 'view-engine.js', prefix: this.name })
}

export default collectViewEngines
