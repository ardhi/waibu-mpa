class Wmpa {
  constructor () {
    this.renderUrl = '/wmpa/component/render'
    this.init()
  }

  init () {
    window.addEventListener('load', evt => {
      if (window.hljs) window.hljs.highlightAll()
    })
  }

  async fetchRender (body) {
    const resp = await fetch(this.renderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body
    })
    if (!resp.ok) throw new Error(`Response status: ${resp.status}`)
    return await resp.text()
  }

  async renderComponent (body, selector, asChild) {
    const html = await this.fetchRender(body)
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    const cmp = tpl.content.firstElementChild
    if (!selector) return cmp
    const el = document.querySelector(selector)
    if (el) {
      if (asChild) el.appendChild(cmp)
      else el.replaceWith(cmp)
    }
  }

  async t (...params) {
    let [text, ...value] = params
    value = value.join('|')
    const body = `<c:t value="${value}">${text}</c:t>`
    return await this.fetchRender(body)
  }

  async copyToClipboard (selector) {
    const el = document.querySelector(selector)
    if (!el) return
    const content = el.textContent
    await navigator.clipboard.writeText(content)
  }
}

const wmpa = new Wmpa() // eslint-disable-line no-unused-vars
