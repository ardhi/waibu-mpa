import * as cheerio from 'cheerio'
import traverse from './build-page/traverse.js'
import injectElements from './build-page/inject-elements.js'
import applyInclude from './build-page/apply-include.js'

async function buildPage ({ text, theme, iconset, reply, locals = {}, partial = false } = {}) {
  const { runHook } = this.app.bajo
  if (!this.config.theme.component || !theme.createComponent) return text

  const opts = {
    xml: {
      xmlMode: false,
      recognizeSelfClosing: true
    }
  }
  const ns = reply.request.ns
  let $ = cheerio.load(text, opts, false)
  if (!partial) {
    if (this.config.theme || (this.config.iconset && iconset)) await runHook(`${this.name}:beforeBuildPage`, { $, theme, iconset, reply, locals, ns })
    if (this.config.theme) await runHook(`${this.name}.${theme.name}:beforeBuildPage`, { $, reply, locals, ns })
    if (this.config.iconset && iconset) await runHook(`${this.name}.${iconset.name}:beforeBuildPage`, { $, reply, locals, ns })
  }
  const cmp = await theme.createComponent($)
  cmp.iconset = iconset
  await traverse.call(this, { el: $.root(), cmp, reply, locals })
  if (!partial) {
    text = applyInclude.call(this, $)
    $ = cheerio.load(text, opts, false)
    injectElements.call(this, { $, theme, iconset, reply })
    if (this.config.iconset && iconset) await runHook(`${this.name}.${iconset.name}:afterBuildPage`, { $, reply, locals, ns })
    if (this.config.theme) await runHook(`${this.name}.${theme.name}:afterBuildPage`, { $, reply, locals, ns })
    if (this.config.theme || (this.config.iconset && iconset)) await runHook(`${this.name}:afterBuildPage`, { $, theme, iconset, reply, locals, ns })
  }
  text = $.root().html()
  return text
}

export default buildPage
