import path from 'path'

async function pageEnd ({ params, reply, locals = {} } = {}) {
  const { generateId } = this.plugin.app.bajo

  const attr = params.attr
  attr.c = 'page-end'
  attr.id = generateId()
  const ext = path.extname((locals._meta ?? {}).template ?? '')
  const hasExt = ['.html', '.md'].includes(ext)
  if (!hasExt) return
  attr.append = '</body></html>'
}

export default pageEnd
