async function include ({ params, reply, locals = {} } = {}) {
  const { generateId } = this.plugin.app.bajo
  const { render } = this.mpa
  const { merge } = this._

  params.attr.c = 'include'
  params.attr.id = generateId()
  const merged = merge({}, locals, params.attr)
  if (!params.html) return
  params.html = await render(params.html, merged, reply, { partial: true })
}

export default include
