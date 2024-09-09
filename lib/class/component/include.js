async function include (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { render } = this.mpa
  const { merge, omit } = this._
  params.tag = 'div'
  const attr = params.attr
  attr.c = 'include'
  attr.id = generateId()
  const merged = merge({}, params.locals, omit(params.attr, ['template']))
  if (!attr.template) return
  params.html = await render(attr.template, merged, params.reply, { partial: true })
}

export default include
