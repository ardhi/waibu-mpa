function getImports (reply) {
  const _app = this.app
  const _ = _app.bajo.lib._
  const i18n = _.get(reply, 'request.i18n')
  const { t, exists } = i18n
  return { _, _app, _t: t, _te: exists }
}

export default getImports
