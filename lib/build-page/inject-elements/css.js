import { collectInline, collectRegular } from './script.js'

export function printLink (link) {
  const { routePath } = this.app.waibu
  return `<link href="${routePath(link)}" rel="stylesheet" type="text/css" />`
}

async function css (options) {
  const { $ } = options ?? {}
  const regular = await collectRegular.call(this, 'css', printLink, options)
  if (regular.length > 0) $('head').append(regular.join('\n'))
  const inline = await collectInline.call(this, 'inlineCss', options)
  if (inline.length > 0) $('head').append(`<style>\n${inline.join('\n')}\n</style>`)
}

export default css
