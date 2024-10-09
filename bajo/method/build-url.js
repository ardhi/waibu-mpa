function buildUrl ({ exclude = [], prefix = '?', base, url = '', params = {} }) {
  const { qs } = this.app.waibu
  const { forOwn, omit } = this.app.bajo.lib._
  const qsKey = this.app.waibu.config.qsKey
  let [path, query] = url.split('?')
  query = qs.parse(query) ?? {}
  forOwn(params, (v, k) => {
    const key = qsKey[k] ?? k
    query[key] = v
  })
  query = prefix + qs.stringify(omit(query, exclude))
  if (!base) return path + query
  const parts = path.split('/')
  if (base) {
    parts.pop()
    parts.push(base)
  }
  return parts.join('/') + query
}

export default buildUrl
