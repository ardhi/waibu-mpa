import * as cheerio from 'cheerio'
import traverse from './build-page/traverse.js'
import injectElements from './build-page/inject-elements.js'
import applyInclude from './build-page/apply-include.js'

async function buildPage ({ text, theme, iconset, reply, locals = {}, partial = false } = {}) {
  if (!this.config.theme.component || !theme.createComponent) return text
  const $ = cheerio.load(text, {
    xml: {
      xmlMode: false,
      recognizeSelfClosing: true
    }
  }, !partial)
  const cmp = await theme.createComponent($)
  cmp.iconset = iconset
  await traverse.call(this, { el: $.root(), cmp, reply, locals })
  if (!partial) {
    $('html').attr('lang', reply.request.lang)
    if ([theme.framework, theme.name].includes('bootstrap') && reply.request.darkMode) $('html').attr('data-bs-theme', 'dark')
    injectElements.call(this, { $, theme, iconset })
    text = applyInclude.call(this, $)
  } else {
    text = $.root().html()
  }
  return text
}

export default buildPage
