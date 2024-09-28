import injectCss from './inject-elements/css.js'
import injectMeta from './inject-elements/meta.js'
import injectScript from './inject-elements/script.js'

async function injectElements (options) {
  const { $, req } = options ?? {}
  $('html').attr('lang', req.lang)
  if (req.darkMode) $('body').attr('data-bs-theme', 'dark')
  await injectCss.call(this, options)
  await injectMeta.call(this, options)
  await injectScript.call(this, options)
}

export default injectElements
