const baseClass = 'pure-button-group'

const btnGroup = {
  selector: '.' + baseClass,
  handler: async function ({ params, reply } = {}) {
    params.tag = 'div'
    params.attr.class.push(baseClass)
    params.attr.role = 'group'
  }
}

export default btnGroup
