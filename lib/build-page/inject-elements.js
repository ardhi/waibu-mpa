import injectCss from './inject-elements/css.js'
import injectMeta from './inject-elements/meta.js'
import injectScript from './inject-elements/script.js'

function injectElements (options) {
  const { $, reply } = options ?? {}
  $('html').attr('lang', reply.request.lang)
  if (reply.request.darkMode) $('body').attr('data-bs-theme', 'dark')
  injectCss.call(this, options)
  injectMeta.call(this, options)
  injectScript.call(this, options)
}

export default injectElements
