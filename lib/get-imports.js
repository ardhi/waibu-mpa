function getImports (reply) {
  const _ = this.app.bajo.lib._
  const i18n = _.get(reply, 'request.i18n')
  const { t, exists } = i18n
  return { _, _t: t, _te: exists }
}

export default getImports
