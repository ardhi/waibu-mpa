import viewEngineFactory from './class/view-engine.js'

async function collectViewEngines () {
  const { eachPlugins, importModule, join, runHook } = this.app.bajo
  const { isFunction, omit, isArray } = this.app.lib._
  this.viewEngines = []
  this.log.debug('collect%s', 'view engines')
  const me = this
  await eachPlugins(async function ({ file }) {
    const { ns } = this
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, me.webAppCtx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      await runHook(`${me.ns}.${mod.name}:beforeCollectViewEngine`, m)
      const Cls = await viewEngineFactory.call(me)
      const ve = new Cls(this, m.name, m.fileExts)
      Object.assign(ve, omit(m, ['name', 'fileExts']))
      me.viewEngines.push(ve)
      me.log.trace('- %s@%s (%s)', ve.name, ns, join(ve.fileExts))
      await runHook(`${me.ns}.${mod.name}:afterCollectViewEngine`, ve)
    }
  }, { glob: 'view-engine.js', prefix: this.ns })
}

export default collectViewEngines
