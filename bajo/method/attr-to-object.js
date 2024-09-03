function attrToObject (text = '', delimiter = ';', kvDelimiter = ':') {
  const { camelCase, isPlainObject } = this.app.bajo.lib._
  const result = {}
  if (isPlainObject(text)) text = this.objectToAttr(text)
  const array = this.attrToArray(text, delimiter)
  array.forEach(item => {
    const [key, val] = this.attrToArray(item, kvDelimiter)
    result[camelCase(key)] = val
  })
  return result
}

export default attrToObject
