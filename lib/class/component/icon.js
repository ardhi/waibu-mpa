async function icon ({ params, reply } = {}) {
  const { get } = this._
  params.tag = 'i'
  const name = get(this.iconset, `mapping.${params.attr.name}`)
  params.attr.class = params.attr.class ?? []
  params.attr.class.unshift(name)
  delete params.attr.name
}

export default icon
