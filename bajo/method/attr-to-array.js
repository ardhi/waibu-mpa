function attrToArray (text = '', delimiter = ' ') {
  const { map, trim, without } = this.app.bajo.lib._
  return without(map(text.split(delimiter), i => trim(i)), '')
}

export default attrToArray
