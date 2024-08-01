const baseCls = 'pure-button-group'

async function btnGroup ({ params, reply } = {}) {
  params.tag = 'div'
  params.attr.class.push(baseCls)
  params.attr.role = 'group'
  return '.' + baseCls
}

export default btnGroup
