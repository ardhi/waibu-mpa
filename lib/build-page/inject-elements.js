import injectCss from './inject-elements/css.js'
import injectMeta from './inject-elements/meta.js'
import injectScript from './inject-elements/script.js'

async function injectElements (options) {
  const { $, req, cmp } = options ?? {}
  const { get, isString, isFunction, isEmpty } = this.app.bajo.lib._
  $('html').attr('lang', req.lang)
  if (req.darkMode) $('body').attr('data-bs-theme', 'dark')
  const rsc = {}
  for (const el of $('[octag]')) {
    for (const key of ['scripts', 'css']) {
      let item = get(cmp, `factory.${el.attribs.octag}.${key}`, [])
      if (isString(item)) item = [item]
      if (isFunction(item)) item = await item.call(cmp, req)
      if (item.length > 0) {
        rsc[key] = rsc[key] ?? []
        rsc[key].push(...item)
      }
    }
    for (const key of ['inlineScript', 'inlineCss']) {
      let item = get(cmp, `factory.${el.attribs.octag}.${key}`)
      if (isFunction(item)) item = await item.call(cmp, req)
      if (!isEmpty(item)) {
        rsc[key] = rsc[key] ?? []
        rsc[key].push(item)
      }
    }
    delete el.attribs.octag
  }
  options.scripts = rsc.scripts ?? []
  options.css = rsc.css ?? []
  options.inlineScript = rsc.inlineScript
  options.inlineCss = rsc.inlineCss
  await injectCss.call(this, options)
  await injectMeta.call(this, options)
  await injectScript.call(this, options)
}

export default injectElements
