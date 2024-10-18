async function manipulation ({ $, el, req } = {}) {
  const actions = ['move-to:replaceWith', 'append-to:append', 'prepend-to:prepend', 'before', 'after']
  for (const action of actions) {
    const [key, method] = action.split(':')
    $(`[${key}]`).each(function () {
      const target = this.attribs[key]
      delete this.attribs[key]
      $(`${target}`)[method ?? key]($(this))
    })
  }
}

export default manipulation
