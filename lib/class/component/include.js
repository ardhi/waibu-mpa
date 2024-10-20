async function include (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { render } = this.plugin.app.waibuMpa
  const { merge, omit } = this.plugin.app.bajo.lib._
  if (!params.attr.resource) return
  params.tag = 'div'
  params.attr.c = 'include'
  params.attr.id = generateId()
  const attr = { attr: omit(params.attr, ['resource', 'c', 'id', 'octag', 'content', 'class', 'style']) }
  const merged = merge({}, this.locals, attr)
  const options = { partial: true, req: this.req, reply: this.reply }
  params.html = await render(params.attr.resource, merged, options)
}

export default include
