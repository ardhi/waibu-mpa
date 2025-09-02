function attribsParse (text = '', delimiter = ' ', kvDelimiter = '=', camelCasedKey = true) {
  const { trim, camelCase, map, isPlainObject, forOwn } = this.app.lib._
  let attrs = []
  if (isPlainObject(text)) {
    forOwn(text, (v, k) => {
      attrs.push(`${k}${kvDelimiter}"${v}"`)
    })
  } else attrs = map(text.split(delimiter), t => trim(t))
  const result = {}
  const names = this.app.getAllNs()
  for (const attr of attrs) {
    let [k, ...v] = map(attr.split(kvDelimiter), a => trim(a))
    v = v.join(kvDelimiter)
    v = v.slice(1, v.length - 1)
    if (v === 'undefined') continue
    if (k !== 'content' && v === '') v = true
    // check for retainAttrKey on ALL plugins
    let retain = false
    for (const name of names) {
      const plugin = this.app[name]
      if (plugin && plugin.retainAttrKey && plugin.retainAttrKey(k)) retain = true
    }
    if (!retain && camelCasedKey) k = camelCase(k)
    result[k] = v
  }
  return result
}

export default attribsParse
