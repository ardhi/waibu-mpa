class Mpa {
  async renderComponent (body, selector) {
    try {
      const resp = await fetch('/wmpa/component/render', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body
      })
      if (!resp.ok) throw new Error(`Response status: ${resp.status}`)
      const tpl = document.createElement('template')
      tpl.innerHTML = await resp.text()
      const cmp = tpl.content.firstElementChild
      if (!selector) return cmp
      const el = document.querySelector(selector)
      if (el) el.replaceWith(cmp)
    } catch (err) {
      console.error(err)
    }
  }
}

const mpa = new Mpa() // eslint-disable-line no-unused-vars
