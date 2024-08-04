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
  if (!partial) {
    if (theme.beforeBuildPage) await theme.beforeBuildPage({ $, reply, locals, partial })
    else if (theme.framework) {
      const fw = theme.getFramework()
      if (fw && fw.beforeBuildPage) await fw.beforeBuildPage({ $, reply, locals, partial })
    }
  }
  const cmp = await theme.createComponent($)
  cmp.iconset = iconset
  await traverse.call(this, { el: $.root(), cmp, reply, locals })
  if (!partial) {
    injectElements.call(this, { $, theme, iconset, reply })
    if (theme.afterBuildPage) await theme.afterBuildPage({ $, reply, locals, partial })
    else if (theme.framework) {
      const fw = theme.getFramework()
      if (fw && fw.afterBuildPage) await fw.afterBuildPage({ $, reply, locals, partial })
    }
    text = applyInclude.call(this, $)
  } else {
    text = $.root().html()
  }
  return text
}

export default buildPage
