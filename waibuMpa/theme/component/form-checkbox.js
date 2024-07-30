async function formCheckbox ({ params, reply, el } = {}) {
  const { has, omit, get } = this._
  const { generateId } = this.bajo
  const attr = params.attr
  attr.type = 'checkbox'
  params.tag = 'input'
  params.selfClosing = true
  if (has(attr, 'label')) {
    attr.id = attr.id ?? generateId()
    const parentAttr = get(this.$(el).parent(), '0.attribs', {})
    const cls = parentAttr.mode === 'inline' ? '' : 'class="pure-checkbox"'
    params.wrap = `<label ${cls} for="${attr.id}"></label>`
    params.after = ` ${attr.label}`
  }
  params.attr = omit(attr, ['label'])
}

export default formCheckbox
