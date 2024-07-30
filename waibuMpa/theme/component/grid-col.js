const sizes = ['sm', 'md', 'lg', 'xl', 'xxl']
const width = {}
for (let i = 1; i < 13; i++) width[i] = `-${i * 2}-24`

async function gridCol ({ params, reply } = {}) {
  const { omit, map, without } = this._
  const { attrToArray } = this.mpa

  const attr = params.attr
  let cols = attrToArray(attr.col)
  if (cols.length > 1) {
    cols = without(map(cols, c => {
      const [s, w] = c.split(':').map(i => i.trim())
      if (!sizes.includes(s)) return undefined
      if (!width[w]) return undefined
      return `pure-u-${s}${width[w]}`
    }), undefined)
    cols.unshift('pure-u-1')
  } else {
    if (width[attr.col]) cols = [`pure-u${width[attr.col]}`]
  }
  params.attr.class = cols
  params.attr = omit(attr, ['col'])
}

export default gridCol
