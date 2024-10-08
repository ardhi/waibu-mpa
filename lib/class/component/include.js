async function include (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { render } = this.plugin.app.waibuMpa
  const { merge, omit } = this.plugin.app.bajo.lib._
  params.tag = 'div'
  const attr = params.attr
  attr.c = 'include'
  attr.id = generateId()
  const merged = merge({}, this.locals, omit(params.attr, ['resource']))
  if (!attr.resource) return
  params.html = await render(attr.resource, merged, { partial: true, req: this.req, reply: this.reply })
}

export default include
