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
  const alpineInits = []
  $('script[type="alpine:init"]').each(function () {
    alpineInits.push($(this).prop('innerHTML'))
    $(this).remove()
  })
  if (alpineInits.length > 0) {
    alpineInits.unshift('<script>', 'document.addEventListener("alpine:init", () => {')
    alpineInits.push('})', '</script>')
    $('body').append(alpineInits.join('\n'))
  }
}

export default manipulation
