async function pageEnd (params = {}) {
  const { generateId } = this.plugin.app.bajo

  params.tag = 'div'
  params.attr.c = 'page-end'
  params.id = generateId()
  params.append = '</body></html>'
}

export default pageEnd
