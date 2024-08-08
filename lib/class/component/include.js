async function include ({ params, reply, locals = {} } = {}) {
  const { generateId } = this.plugin.app.bajo
  const { render } = this.mpa
  const { merge, omit } = this._

  const attr = params.attr
  attr.c = 'include'
  attr.id = generateId()
  const merged = merge({}, locals, omit(params.attr, ['template']))
  if (!attr.template) return
  params.html = await render(attr.template, merged, reply, { partial: true })
}

export default include
