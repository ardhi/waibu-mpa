import path from 'path'

async function pageEnd ({ params, reply, locals = {} } = {}) {
  const { generateId } = this.plugin.app.bajo

  const attr = params.attr
  attr.c = 'page-end'
  attr.id = generateId()
  const meta = locals._meta ?? {}
  const ext = path.extname(meta.template ?? meta.ext ?? '')
  const hasExt = ['.html', '.md'].includes(ext)
  if (!hasExt) return
  attr.append = '</body></html>'
}

export default pageEnd
