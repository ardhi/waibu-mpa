async function manipulation ({ $, theme } = {}) {
  const { isEmpty } = this.app.bajo.lib._
  const actions = ['move-to:replaceWith', 'append-to:append', 'prepend-to:prepend', 'before', 'after']
  for (const action of actions) {
    const [key, method] = action.split(':')
    $(`[${key}]`).each(function () {
      const target = this.attribs[key]
      delete this.attribs[key]
      $(`${target}`)[method ?? key]($(this))
    })
  }
  // force move all drawer, modal before </body>
  if (!isEmpty(theme.moveToEnd)) {
    $(theme.moveToEnd).each(function () {
      $('body').append(this)
    })
  }
  // force all alpine scripts to move
  const allScripts = []
  for (const item of ['initializing', 'init']) {
    const scripts = []
    $(`script[type="alpine:${item}"]`).each(function () {
      scripts.push($(this).prop('innerHTML'))
      $(this).remove()
    })
    if (scripts.length > 0) {
      scripts.unshift(`document.addEventListener("alpine:${item}", () => {`)
      scripts.push('})')
      allScripts.push(...scripts)
    }
  }
  if (allScripts.length > 0) {
    allScripts.unshift('<script>')
    allScripts.push('</script>')
    $('body').append(allScripts.join('\n'))
  }
}

export default manipulation
