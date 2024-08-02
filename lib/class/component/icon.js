async function icon ({ params, reply } = {}) {
  const { get } = this._
  params.tag = 'i'
  const defIconset = this._getIconset('default')
  let name = get(this.iconset, `mapping.${params.attr.name}`)
  if (!name) name = get(defIconset, `mapping.${params.attr.name}`)
  if (!name) name = get(defIconset, 'mapping._notFound')
  params.attr.class = params.attr.class ?? []
  params.attr.class.unshift(name)
  delete params.attr.name
}

export default icon
