async function formCheckbox ({ params, reply, el } = {}) {
  const { has, omit, get } = this._
  const { generateId } = this.bajo
  const attr = params.attr
  attr.type = 'checkbox'
  params.tag = 'input'
  params.selfClosing = true
  const formAttr = get(this.$(el).closest('c\\:form'), '0.attribs', {})
  if (has(attr, 'label')) {
    attr.id = attr.id ?? generateId()
    const cls = formAttr.mode === 'inline' ? '' : 'class="pure-checkbox"'
    params.before = `<label ${cls} for="${attr.id}">`
    params.after = ` ${attr.label}</label>`
  }
  params.attr = omit(attr, ['label'])
}

export default formCheckbox