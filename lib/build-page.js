import * as cheerio from 'cheerio'
import replaceTag from './build-page/replace-tag.js'
import injectElements from './build-page/inject-elements.js'
import applyInclude from './build-page/apply-include.js'
import attrsMutation from './build-page/attrs-mutation.js'
import manipulation from './build-page/manipulation.js'
import concatResources from './build-page/concat-resources.js'

function alert (text, message, opts) {
  if (opts.partial) throw this.error(message)
  if (!this.config.page.insertWarning) return text
  const error = `<p class="warning">${message}</p>`
  return `${text}\n${error}`
}

async function buildPage ({ text, locals = {}, opts = {} } = {}) {
  const { find, cloneDeep } = this.app.bajo.lib._
  const { runHook } = this.app.bajo
  const { req, reply } = opts
  if (!opts.theme) return alert.call(this, text, req.t('Warning: no theme provided!'), opts)
  const theme = find(this.themes, { name: opts.theme })
  if (!theme) return alert.call(this, text, req.t('Warning: unknown theme \'%s\'. Make sure it\'s already loaded', req.theme), opts)
  const iconset = find(this.iconsets, { name: opts.iconset })
  const partial = opts.partial
  const ns = req.ns
  let $ = cheerio.load(text, this.config.cheerio.loadOptions, false)
  if (partial) $('c\\:page-start, c\\:page-end').remove()
  await runHook(`${this.name}:beforeBuildPage${partial ? 'Partial' : ''}`, { $, theme, iconset, req, reply, locals, ns, text })
  await attrsMutation.call(this, { $, el: $.root(), req })
  const cmp = await theme.createComponent({ $, iconset, req, reply, locals: cloneDeep(locals) })
  await replaceTag.call(this, { el: $.root(), cmp, opts })
  text = applyInclude.call(this, $)
  if (!opts.partial) {
    $ = cheerio.load(text, this.config.cheerio.loadOptions, false)
    await manipulation.call(this, { $, el: $.root(), req })
    await injectElements.call(this, { $, cmp, theme, iconset, req, locals, opts })
    await concatResources.call(this, { $, theme, iconset, req })
    text = $.root().html()
  }
  await runHook(`${this.name}:afterBuildPage${partial ? 'Partial' : ''}`, { $, theme, iconset, req, reply, locals, ns, text })
  return text
}

export default buildPage
