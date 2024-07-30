async function btnGroup ({ params, reply } = {}) {
  params.tag = 'div'
  params.attr.class.push('pure-button-group')
  params.attr.role = 'group'
}

export default btnGroup
