import { collectRegular } from './script.js'

export function printLink (link) {
  const { routePath } = this.app.waibu
  const { isString } = this.app.lib._
  const item = isString(link) ? { href: link, rel: 'stylesheet', type: 'text/css' } : link
  if (item.href) item.href = routePath(item.href)
  const attrs = this.stringifyAttribs(item)
  return `<link ${attrs} />`
}

async function link (options) {
  const { $ } = options ?? {}
  const regular = await collectRegular.call(this, 'links', printLink, options)
  if (regular.length > 0) $('head').append(regular.join('\n'))
}

export default link
