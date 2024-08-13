import path from 'path'

async function pageStart ({ params, reply, locals = {} } = {}) {
  const { generateId } = this.plugin.app.bajo

  const attr = params.attr
  attr.c = 'page-start'
  attr.id = generateId()
  const meta = locals._meta ?? {}
  const ext = path.extname(meta.template ?? meta.ext ?? '')
  const hasExt = ['.html', '.md'].includes(ext)
  if (!hasExt) return
  attr.prepend = '<!DOCTYPE html><html><head>'
  attr.append = '</head><body>'
  if (attr.title) params.html = `<title>${attr.title}</title>\n${params.html}`
}

export default pageStart
