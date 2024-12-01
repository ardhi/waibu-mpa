import injectCss from './inject-elements/css.js'
import injectMeta from './inject-elements/meta.js'
import injectScript from './inject-elements/script.js'

async function injectElements (options) {
  const { $, req, cmp, reply } = options ?? {}
  const { isClass } = this.app.bajo
  const { get, isString, isFunction, isEmpty } = this.app.bajo.lib._
  $('html').attr('lang', req.lang)
  if (req.darkMode) $('body').attr('data-bs-theme', 'dark')
  const rsc = {}
  for (const tag of reply.ctags) {
    let Builder = get(cmp, `factory.${tag}`)
    if (!isFunction(Builder)) continue
    if (!isClass(Builder)) Builder = await Builder.call(cmp)
    for (const key of ['scripts', 'css']) {
      let item = Builder[key] ?? []
      if (isString(item)) item = [item]
      if (isFunction(item)) item = await item.call(cmp, req)
      if (item.length > 0) {
        rsc[key] = rsc[key] ?? []
        rsc[key].push(...item)
      }
    }
    for (const key of ['inlineScript', 'inlineCss']) {
      let item = Builder[key] ?? ''
      if (isFunction(item)) item = await item.call(cmp, req)
      if (!isEmpty(item)) {
        rsc[key] = rsc[key] ?? []
        rsc[key].push(item)
      }
    }
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
