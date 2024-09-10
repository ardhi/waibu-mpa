const tag = 'select'

const formSelect = {
  selector: tag,
  handler: async function ({ params, reply, el } = {}) {
    const { has, omit, get } = this.plugin.app.bajo.lib._
    const { generateId } = this.bajo
    const attr = params.attr
    params.tag = tag
    const formAttr = get(this.$(el).closest('c\\:form'), '0.attribs', {})
    if (formAttr.mode === 'horizontal') params.wrap = '<div class="pure-control-group"></div>'
    if (has(attr, 'label')) {
      attr.id = attr.id ?? generateId()
      params.before = `<label for="${attr.id}">${attr.label}</label>`
    }
    if (has(attr, 'rounded')) attr.class.push('pure-input-rounded')
    if (has(attr, 'hint')) params.after = `<span class="pure-form-message-inline">${attr.hint}</span>`
    params.attr = omit(attr, ['label', 'hint', 'rounded'])
  }
}

export default formSelect
