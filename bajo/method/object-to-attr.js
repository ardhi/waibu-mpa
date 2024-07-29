function objectToAttr (obj = {}, delimiter = '|', kvDelimiter = '=') {
  const { forOwn, kebabCase } = this.app.bajo.lib._
  const result = []
  forOwn(obj, (v, k) => {
    result.push(`${kebabCase(k)}${kvDelimiter} ${v ?? ''}`)
  })
  return result.join(delimiter + ' ')
}

export default objectToAttr
