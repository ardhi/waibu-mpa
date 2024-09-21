async function icon (params = {}) {
  const { has, omit, isEmpty } = this.plugin.app.bajo.lib._
  this._normalizeAttr(params)
  params.tag = 'i'
  if (has(params.attr, 'oname')) params.attr.class.unshift(params.attr.oname)
  else if (this.iconset) {
    if (this.iconset.handler) await this.iconset.handler(params)
    else {
      const item = this.iconset.resolve(params.attr.name)
      if (!isEmpty(item)) params.attr.class.unshift(item)
    }
  }
  params.html = ''
  params.attr = omit(params.attr, ['name', 'oname'])
  return await this._render(params)
}

export default icon
