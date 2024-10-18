import injectCss from './inject-elements/css.js'
import injectMeta from './inject-elements/meta.js'
import injectScript from './inject-elements/script.js'

async function injectElements (options) {
  const { $, req, cmp } = options ?? {}
  const { get, isString } = this.app.bajo.lib._
  $('html').attr('lang', req.lang)
  if (req.darkMode) $('body').attr('data-bs-theme', 'dark')
  const rsc = {}
  $('[octag]').each(function () {
    for (const key of ['scripts', 'css']) {
      let item = get(cmp, `factory.${this.attribs.octag}.${key}`, [])
      if (isString(item)) item = [item]
      if (item.length > 0) {
        rsc[key] = rsc[key] ?? []
        rsc[key].push(...item)
      }
    }
    for (const key of ['inlineScript', 'inlineCss']) {
      rsc[key] = get(cmp, `factory.${this.attribs.octag}.${key}`)
    }
    delete this.attribs.octag
  })
  options.scripts = rsc.scripts ?? []
  options.css = rsc.css ?? []
  options.inlineScript = rsc.inlineScript
  options.inlineCss = rsc.inlineCss
  await injectCss.call(this, options)
  await injectMeta.call(this, options)
  await injectScript.call(this, options)
}

export default injectElements
