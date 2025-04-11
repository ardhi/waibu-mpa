async function subApp (ctx) {
  const { importModule, runHook } = this.app.bajo
  const { collect } = await importModule('waibu:/lib/app.js', { asDefaultImport: false })
  await runHook(`${this.name}:beforeSubApp`, ctx)
  const mods = await collect.call(this.app[this.name], 'boot.js', 'waibuMpa')
  for (const m of mods) {
    this.log.debug('bootSubApp%s', m.ns)
    await ctx.register(async (subCtx) => {
      this.app[m.ns].instance = subCtx
      await runHook(`${this.name}.${m.alias}:afterCreateContext`, subCtx, m.prefix)
      await m.handler.call(this.app[m.ns], subCtx, m.prefix)
    }, { prefix: m.prefix })
  }
  await runHook(`${this.name}:afterSubApp`, ctx)
}

export default subApp
