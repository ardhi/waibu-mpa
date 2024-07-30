const baseCls = 'pure-button'

async function btn ({ params, reply } = {}) {
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
  if (has(attr, 'icon')) {
    const args = { attr: { name: attr.icon }, html: '' }
    await this.icon({ params: args, reply })
    params.html = await this._renderTag('i', { params: args, reply }) + ' ' + params.html
  }
  if (has(attr, 'icon-end')) {
    const args = { attr: { name: attr['icon-end'] }, html: '' }
    await this.icon({ params: args, reply })
    params.html += ' ' + await this._renderTag('i', { params: args, reply })
  }
  const omitted = ['icon', 'icon-end']
  if (params.tag === 'a' && has(attr, 'disabled')) {
    attr.class.push('pure-button-disabled')
    omitted.push('disabled')
  }
  params.attr = omit(attr, omitted)
}

export default btn
