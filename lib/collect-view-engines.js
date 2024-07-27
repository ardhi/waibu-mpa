import ViewEngine from './class/view-engine.js'

async function collectViewEngines (ctx) {
  const { eachPlugins, importModule, join } = this.app.bajo
  const { isFunction, omit } = this.app.bajo.lib._
  this.viewEngines = []
  this.log.debug('Collect view engines')
  const me = this
  await eachPlugins(async function ({ file, ns }) {
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    const ve = new ViewEngine(this, mod.name, mod.fileExts)
    Object.assign(ve, omit(mod, ['name', 'fileExts']))
    me.viewEngines.push(ve)
    me.log.trace('- %s@%s (%s)', ve.name, ns, join(ve.fileExts))
  }, { glob: 'view-engine.js', baseNs: this.name })
}

export default collectViewEngines
