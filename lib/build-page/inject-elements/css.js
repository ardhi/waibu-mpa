import { collectInline, collectRegular } from './script.js'

export function printLink (link) {
  const { routePath } = this.app.waibu
  return `<link href="${routePath(link)}" rel="stylesheet" type="text/css" />`
}

async function css (options) {
  const { $ } = options ?? {}
  const inline = await collectInline.call(this, 'inlineCss', options)
  if (inline.length > 0) $('head').prepend(`<style>\n${inline.join('\n')}\n</style>`)
  const regular = await collectRegular.call(this, 'css', printLink, options)
  if (regular.length > 0) $('head').prepend(regular.join('\n'))
}

export default css
