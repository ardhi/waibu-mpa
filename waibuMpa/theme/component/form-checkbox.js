const tag = 'input'
const type = 'checkbox'

const formCheckbox = {
  selector: `${tag}[type=${type}]`,
  handler: async function ({ params, reply, el } = {}) {
    const { has, omit, get } = this.plugin.app.bajo.lib._
    const { generateId } = this.plugin.app.bajo
    const attr = params.attr
    attr.type = type
    params.tag = tag
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
}

export default formCheckbox
