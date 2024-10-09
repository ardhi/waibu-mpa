async function teleport ({ $, el, req } = {}) {
  $('[teleport]').each(function () {
    const target = this.attribs.teleport
    delete this.attribs.teleport
    $(`${target}`).replaceWith($(this))
  })
}

export default teleport
