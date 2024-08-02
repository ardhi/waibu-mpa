const baseCls = 'pure-button-group'

const btnGroup = {
  selector: '.' + baseCls,
  handler: async function ({ params, reply } = {}) {
    params.tag = 'div'
    params.attr.class.push(baseCls)
    params.attr.role = 'group'
  }
}

export default btnGroup
