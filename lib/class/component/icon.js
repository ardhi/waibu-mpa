async function icon (params = {}) {
  const { has, get, omit } = this.plugin.app.bajo.lib._
  this._normalizeAttr(params)
  params.tag = 'i'
  const iconset = this._getIconset(params.reply.request.iconset)
  if (has(params.attr, 'oname')) params.attr.class.unshift(params.attr.oname)
  else if (iconset && iconset.handler) await iconset.handler(params)
  else if (iconset) {
    const name = get(iconset, `mapping.${params.attr.name}`)
    if (name) params.attr.class.unshift(name)
    else params.noTag = true
  }
  params.html = ''
  params.attr = omit(params.attr, ['name', 'oname'])
  return await this._render(params)
}

export default icon
