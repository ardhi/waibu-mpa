// TODO: exclusion with outmatch

function attrsToObject (text, delimiter = ' ', kvDelimiter = '=', kebabCasedKey = true) {
  const { trim, kebabCase, map } = this.app.bajo.lib._
  const attrs = map(text.split(delimiter), t => trim(t))
  const result = {}
  for (const attr of attrs) {
    let [k, v] = map(attr.split(kvDelimiter, a => trim(a)))
    if (kebabCasedKey) k = kebabCase(k)
    v = v.slice(1, v.length - 1)
    result[k] = v
  }
  return result
}

export default attrsToObject
