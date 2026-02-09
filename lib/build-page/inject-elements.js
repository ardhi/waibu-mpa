import injectCss from './inject-elements/css.js'
import injectMeta from './inject-elements/meta.js'
import injectScript from './inject-elements/script.js'
import injectLink from './inject-elements/link.js'

async function injectElements (options) {
  const { $, req, cmp, reply } = options ?? {}
  const { isClass } = this.app.lib.aneka
  const { runHook } = this.app.bajo
  const { get, isString, isFunction, isEmpty } = this.app.lib._
  $('html').attr('lang', req.lang)
  if (req.darkMode) $('body').attr('data-bs-theme', 'dark')
  const rsc = {}
  for (const tag of reply.ctags ?? []) {
    let Builder = get(cmp, `widget.${tag}`)
    if (!isFunction(Builder)) continue
    if (!isClass(Builder)) Builder = await Builder.call(cmp)
    for (const key of ['links', 'scripts', 'css']) {
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
  for (const key of ['links', 'scripts', 'css']) {
    options[key] = rsc[key] ?? []
  }
  options.inlineScript = rsc.inlineScript
  options.inlineCss = rsc.inlineCss
  await runHook(`${this.ns}:beforeBuildPageInjectElement`, options)
  await injectMeta.call(this, options)
  await injectLink.call(this, options)
  await injectCss.call(this, options)
  await injectScript.call(this, options)
}

export default injectElements
