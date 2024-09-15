async function icon (params = {}) {
  const { has, get, omit } = this.plugin.app.bajo.lib._
  this._normalizeAttr(params)
  params.tag = 'i'
  if (has(params.attr, 'oname')) params.attr.class.unshift(params.attr.oname)
  else if (this.iconset && this.iconset.handler) await this.iconset.handler(params)
  else if (this.iconset) {
    const name = get(this.iconset, `mapping.${params.attr.name}`)
    if (name) params.attr.class.unshift(name)
    else params.noTag = true
  }
  params.html = ''
  params.attr = omit(params.attr, ['name', 'oname'])
  return await this._render(params)
}

export default icon
