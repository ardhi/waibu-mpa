const wakatobiMpaPreHandler = {
  level: 9,
  handler: async function (ctx, req, reply) {
    const { importModule } = this.app.bajo
    const attachI18N = await importModule('wakatobi:/lib/webapp-scope/attach-i18n.js')
    await attachI18N.call(this, this.config.i18n.detectors, req, reply)
    // darkmode
    // if (this.config.darkMode.qsKey) req.dark = req.query[this.config.darkMode.qsKey] ? 'dark' : 'light'
  }
}

export default wakatobiMpaPreHandler
