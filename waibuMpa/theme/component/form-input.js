async function formInput ({ params, reply } = {}) {
  const { has, omit } = this._
  const { generateId } = this.bajo
  const attr = params.attr
  params.tag = 'input'
  params.selfClosing = true
  if (has(attr, 'label')) {
    attr.id = attr.id ?? generateId()
    const html = []
    params.noTag = true
    const args = { attr: omit(attr, ['label']) }
    args.tag = params.tag
    args.selfClosing = params.selfClosing
    html.push(`<label for="${attr.id}"></label>`)
    html.push(await this._renderTag('input', { params: args, reply }))
    params.html = html.join('\n')
    delete attr.label
  }
}

export default formInput
