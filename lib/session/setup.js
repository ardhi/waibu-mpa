import Store from './store.js'

async function sessionSetup (ctx) {
  const { importPkg, runHook } = this.app.bajo
  const [cookie, session, flash] = await importPkg('waibu:@fastify/cookie',
    'waibu:@fastify/session', 'waibu:@fastify/flash')
  const cfg = this.getConfig('session')
  if (!cfg) return
  await runHook(`${this.ns}:beforeSessionSetup`)
  if (this.app.dobo) {
    this.sessionStore = new Store(this)
    cfg.store = this.sessionStore
  }
  ctx.register(cookie)
  ctx.register(session, cfg)
  ctx.register(flash)
  await runHook(`${this.ns}:afterSessionSetup`, ctx)
}

export default sessionSetup
