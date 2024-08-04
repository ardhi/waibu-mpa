const baseCls = 'pure-button'

const btn = {
  selector: '.' + baseCls,
  handler: async function ({ params, reply } = {}) {
    const { has, isEmpty, omit } = this._

    const attr = params.attr
    // tag
    params.tag = has(attr, 'href') || attr.tag === 'a' ? 'a' : 'button'
    if (params.tag === 'button' && attr.href) delete attr.href
    if (params.tag === 'a' && isEmpty(attr.href)) attr.href = '#'
    // def
    attr.class.push(baseCls)
    for (const item of ['active']) {
      this._hasAttr(attr, item, baseCls)
    }
    for (const item of ['variant', 'size']) {
      this._getAttr(attr, item, baseCls)
    }
    const omitted = []
    if (params.tag === 'a' && has(attr, 'disabled')) {
      attr.class.push('pure-button-disabled')
      omitted.push('disabled')
    }
    params.attr = omit(attr, omitted)
  }
}

export default btn
