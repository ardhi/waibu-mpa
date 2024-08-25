async function pageEnd ({ params, reply, locals = {} } = {}) {
  const { generateId } = this.plugin.app.bajo

  const attr = params.attr
  params.tag = 'div'
  attr.c = 'page-end'
  attr.id = generateId()
  attr.append = '</body></html>'
}

export default pageEnd
