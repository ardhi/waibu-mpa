const sizes = ['sm', 'md', 'lg', 'xl', 'xxl']
const width = {}
for (let i = 1; i < 13; i++) width[i] = `-${i * 2}-24`
const baseClass = 'pure-u'

const gridCol = {
  selector: `[class^=${baseClass}]`,
  handler: async function ({ params, reply } = {}) {
    const { omit, map, without } = this.plugin.app.bajo.lib._
    const { attrToArray } = this.plugin.app.waibuMpa

    const attr = params.attr
    let cols = attrToArray(attr.size)
    if (cols.length > 1) {
      cols = without(map(cols, c => {
        const [s, w] = c.split(':').map(i => i.trim())
        if (!sizes.includes(s)) return undefined
        if (!width[w]) return undefined
        return `${baseClass}-${s}${width[w]}`
      }), undefined)
      cols.unshift(`${baseClass}-1`)
    } else {
      if (width[attr.size]) cols = [`${baseClass}${width[attr.size]}`]
      else cols = [baseClass]
    }
    params.attr.class = attr.class.concat(cols)
    params.attr = omit(attr, ['size'])
  }
}

export default gridCol
