const defValues = ['active']

function _hasAttr (attr, value, cls, values) {
  const { has, cloneDeep } = this.plugin.app.bajo.lib._
  if (!values) values = cloneDeep(defValues)
  if (values.includes(value) && has(attr, value)) {
    attr.class.push(`${cls}-${value}`)
    delete attr.active
  }
}

export default _hasAttr
