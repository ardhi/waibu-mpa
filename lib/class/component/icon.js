async function icon ({ params, reply } = {}) {
  const { has, get, omit } = this._
  params.tag = 'i'
  const attr = params.attr
  attr.class = attr.class ?? []
  attr.style = attr.style ?? {}
  const iconset = this._getIconset(reply.request.iconset)
  if (has(attr, 'oname')) attr.class.unshift(attr.oname)
  else if (iconset && iconset.handler) await iconset.handler({ params, reply })
  else if (iconset) attr.class.unshift(get(iconset, `mapping.${attr.name}`))
  params.attr = omit(attr, ['name', 'oname'])
}

export default icon
