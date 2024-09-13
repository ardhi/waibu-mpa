async function pageStart (params = {}) {
  const { generateId, escape } = this.plugin.app.bajo

  params.tag = 'div'
  params.attr.c = 'page-start'
  params.attr.id = generateId()
  params.attr.prepend = escape('<!DOCTYPE html><html><head>')
  params.attr.append = escape('</head><body>')
  if (params.attr.title) params.html = `<title>${params.attr.title}</title>\n${params.html}`
}

export default pageStart
