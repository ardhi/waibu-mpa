import { collectRegular } from './script.js'

export function printLink (link) {
  const { routePath } = this.app.waibu
  link.rel = link.rel ?? 'stylesheet'
  link.type = link.type ?? 'text/css'
  link.href = routePath(link.href)
  const attrs = this.stringifyAttribs(link)
  return `<link ${attrs} />`
}

async function link (options) {
  const { $ } = options ?? {}
  const regular = await collectRegular.call(this, 'links', printLink, options)
  if (regular.length > 0) $('head').append(regular.join('\n'))
}

export default link
