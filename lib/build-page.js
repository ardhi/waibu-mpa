import * as cheerio from 'cheerio'
import replaceTag from './build-page/replace-tag.js'
import injectElements from './build-page/inject-elements.js'
import applyInclude from './build-page/apply-include.js'
import mutation from './build-page/mutation.js'

function alert (text, message) {
  if (!this.config.page.insertWarning) return text
  const error = `<p class="warning">${message}</p>`
  return `${text}\n${error}`
}

async function buildPage ({ text, reply, locals = {}, opts = {} } = {}) {
  const { find } = this.app.bajo.lib._
  const { runHook } = this.app.bajo
  if (!opts.theme) return alert.call(this, text, reply.request.t('Warning: no theme provided!'))
  const theme = find(this.themes, { name: opts.theme })
  if (!theme) return alert.call(this, text, reply.request.t('Warning: unknown theme \'%s\'. Make sure it\'s already loaded', reply.request.theme))
  const iconset = find(this.iconsets, { name: opts.iconset })
  const partial = opts.partial

  const options = {
    xml: {
      xmlMode: false,
      recognizeSelfClosing: true
    }
  }
  const ns = reply.request.ns
  let $ = cheerio.load(text, options, false)
  if (partial) $('c\\:page-start, c\\:page-end').remove()
  await runHook(`${this.name}:beforeBuildPage${partial ? 'Partial' : ''}`, { $, theme, iconset, reply, locals, ns, text })
  const cmp = await theme.createComponent($, iconset)
  await mutation.call(this, { $, el: $.root(), reply })
  await replaceTag.call(this, { el: $.root(), cmp, reply, locals })
  text = applyInclude.call(this, $)
  $ = cheerio.load(text, options, false)
  await injectElements.call(this, { $, theme, iconset, reply })
  await runHook(`${this.name}:afterBuildPage${partial ? 'Partial' : ''}`, { $, theme, iconset, reply, locals, ns, text })
  text = $.root().html()
  return text
}

export default buildPage
