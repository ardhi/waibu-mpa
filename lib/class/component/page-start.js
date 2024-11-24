async function pageStart (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { escape } = this.plugin.app.waibu

  params.tag = 'div'
  params.attr.c = 'page-start'
  params.attr.id = generateId()
  params.attr.prepend = escape('<!DOCTYPE html><html><head>')
  params.attr.append = escape('</head><body>')
  if (params.attr.title) params.html = `<title>${params.attr.title}</title>\n${params.html}`
}

export default pageStart
