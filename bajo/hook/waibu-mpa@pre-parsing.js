async function checkLang (req, reply) {
  if (!req.session) return
  if (req.langDetector) {
    req.session.lang = req.lang
    await req.i18n.changeLanguage(req.session.lang)
    return
  }
  if (req.session.lang) req.lang = req.session.lang
  await req.i18n.changeLanguage(req.lang)
}

async function checkDark (req, reply) {
  const { isSet } = this.app.bajo
  const key = this.config.darkMode.qsKey
  const value = req.query[key]
  if (isSet(value)) {
    req.darkMode = value
    if (req.session) req.session.darkMode = req.darkMode
    return
  }
  if (isSet(req.session.darkMode)) req.darkMode = req.session.darkMode
}

const waibuMpaPreParsing = {
  level: 9,
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const attachI18N = await importModule('waibu:/lib/webapp-scope/attach-i18n.js')
    await attachI18N.call(this, this.config.i18n.detectors, req, reply)
    await checkLang.call(this, req, reply)
    await checkDark.call(this, req, reply)
  }
}

export default waibuMpaPreParsing
