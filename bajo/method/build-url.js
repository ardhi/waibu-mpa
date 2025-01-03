function buildUrl ({ exclude = [], prefix = '?', base, url = '', params = {} }) {
  const { qs } = this.app.waibu
  const { forOwn, omit, isEmpty } = this.app.bajo.lib._
  const qsKey = this.app.waibu.config.qsKey
  let path
  let hash
  let query
  [path = '', hash = ''] = url.split('#')
  if (hash.includes('?')) [hash, query] = hash.split('?')
  else [path, query] = path.split('?')
  query = qs.parse(query) ?? {}
  forOwn(params, (v, k) => {
    const key = qsKey[k] ?? k
    query[key] = v
  })
  query = prefix + qs.stringify(omit(query, exclude))
  if (!isEmpty(hash)) hash = '#' + hash
  if (!base) return path + query + hash
  const parts = path.split('/')
  if (base) {
    parts.pop()
    parts.push(base)
  }
  return parts.join('/') + query + hash
}

export default buildUrl
