import * as cheerio from 'cheerio'
import traverse from './build-page/traverse.js'
import injectElements from './build-page/inject-elements.js'
import applyInclude from './build-page/apply-include.js'

async function buildPage ({ text, theme, iconset, reply, locals = {}, partial = false } = {}) {
  const { runHook } = this.app.bajo

  if (!this.config.theme.component || !theme.createComponent) return text
  const $ = cheerio.load(text, {
    xml: {
      xmlMode: false,
      recognizeSelfClosing: true
    }
  }, !partial)
  if (!partial) {
    if (this.config.theme || (this.config.iconset && iconset)) await runHook(`${this.name}:beforeBuildPage`, { $, theme, iconset, reply, locals })
    if (this.config.theme) await runHook(`${this.name}.${theme.name}:beforeBuildPage`, { $, reply, locals })
    if (this.config.iconset && iconset) await runHook(`${this.name}.${iconset.name}:beforeBuildPage`, { $, reply, locals })
  }
  const cmp = await theme.createComponent($)
  cmp.iconset = iconset
  await traverse.call(this, { el: $.root(), cmp, reply, locals })
  if (!partial) {
    injectElements.call(this, { $, theme, iconset, reply })
    if (this.config.iconset && iconset) await runHook(`${this.name}.${iconset.name}:afterBuildPage`, { $, reply, locals })
    if (this.config.theme) await runHook(`${this.name}.${theme.name}:afterBuildPage`, { $, reply, locals })
    if (this.config.theme || (this.config.iconset && iconset)) await runHook(`${this.name}:afterBuildPage`, { $, theme, iconset, reply, locals })
    text = applyInclude.call(this, $)
  } else {
    text = $.root().html()
  }
  return text
}

export default buildPage
