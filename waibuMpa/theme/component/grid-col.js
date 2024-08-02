const sizes = ['sm', 'md', 'lg', 'xl', 'xxl']
const width = {}
for (let i = 1; i < 13; i++) width[i] = `-${i * 2}-24`
const baseCls = 'pure-u'

const gridCol = {
  selector: `[class^=${baseCls}]`,
  handler: async function ({ params, reply } = {}) {
    const { omit, map, without } = this._
    const { attrToArray } = this.mpa

    const attr = params.attr
    let cols = attrToArray(attr.size)
    if (cols.length > 1) {
      cols = without(map(cols, c => {
        const [s, w] = c.split(':').map(i => i.trim())
        if (!sizes.includes(s)) return undefined
        if (!width[w]) return undefined
        return `${baseCls}-${s}${width[w]}`
      }), undefined)
      cols.unshift(`${baseCls}-1`)
    } else {
      if (width[attr.size]) cols = [`${baseCls}${width[attr.size]}`]
      else cols = [baseCls]
    }
    params.attr.class = attr.class.concat(cols)
    params.attr = omit(attr, ['size'])
  }
}

export default gridCol
