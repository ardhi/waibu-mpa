import Store from './store.js'

async function trashOld () {
  if (!this.app.dobo) return
  const { get } = this.app.lib._
  const { dayjs } = this.app.lib
  const model = this.app.dobo.getModel('WmpaSession')
  const recs = await model.findAllRecord({ sort: { createdAt: 1 } }, { noHook: true, noModelHook: true })
  for (const rec of recs) {
    let expires = get(rec, 'session.cookie.expires')
    if (!expires) expires = dayjs(rec.createdAt).add(this.config.session.cookie.maxAge, 'ms').toISOString()
    const diff = dayjs(expires).diff(dayjs())
    if (diff < 0) await model.removeRecord(rec.id, { noReturn: true })
  }
}

async function sessionSetup () {
  const { importPkg, runHook } = this.app.bajo
  const [cookie, session, flash] = await importPkg('waibu:@fastify/cookie',
    'waibu:@fastify/session', 'waibu:@fastify/flash')
  const cfg = this.getConfig('session')
  if (!cfg) return
  delete cfg.trashOldDur
  await runHook(`${this.ns}:beforeSessionSetup`)
  if (this.app.dobo) {
    this.sessionStore = new Store(this)
    cfg.store = this.sessionStore
  }
  this.webAppCtx.register(cookie)
  this.webAppCtx.register(session, cfg)
  this.webAppCtx.register(flash)
  await runHook(`${this.ns}:afterSessionSetup`, this.webAppCtx)

  trashOld.call(this)
  setInterval(() => {
    trashOld.call(this)
  }, this.config.session.trashOldDur)
}

export default sessionSetup
