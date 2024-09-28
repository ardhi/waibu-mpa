async function t (params = {}) {
  const { attrToArray } = this.plugin.app.waibuMpa

  params.noTag = true
  const value = attrToArray(params.attr.value, '|')
  params.html = this.req.t(params.html, ...value)
}

export default t
