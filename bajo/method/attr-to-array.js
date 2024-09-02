function attrToArray (text = '', delimiter = ' ') {
  const { map, trim, without, isArray } = this.app.bajo.lib._
  if (isArray(text)) text = text.join(delimiter)
  return without(map(text.split(delimiter), i => trim(i)), '', undefined, null)
}

export default attrToArray
