function attrToObject (text = '', delimiter = '|', kvDelimiter = '=') {
  const { camelCase } = this.app.bajo.lib._
  const result = {}
  const array = this.attrToArray(text, delimiter)
  array.forEach(item => {
    const [key, val] = this.attrToArray(item, kvDelimiter)
    result[camelCase(key)] = val
  })
  return result
}

export default attrToObject
