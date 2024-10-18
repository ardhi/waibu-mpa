async function include (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { render } = this.plugin.app.waibuMpa
  const { merge, omit } = this.plugin.app.bajo.lib._
  params.tag = 'div'
  params.attr.c = 'include'
  params.attr.id = generateId()
  const merged = merge({}, this.locals, { attr: omit(params.attr, ['resource', 'c', 'id']) })
  if (!params.attr.resource) return
  params.html = await render(params.attr.resource, merged, { partial: true, req: this.req, reply: this.reply })
}

export default include
