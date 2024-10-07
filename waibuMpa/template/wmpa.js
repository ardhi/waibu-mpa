class Wmpa {
  constructor () {
    this.prefixVirtual = '<%= prefix.virtual %>'
    this.prefixAsset = '<%= prefix.asset %>'
    this.prefixMain = '<%= prefix.main %>'
    this.renderUrl = '<%= _meta.routeOpts.prefix === "" ? "" : ("/" + _meta.routeOpts.prefix) %>/component/render'
    this.init()
  }

  init () {
    window.addEventListener('load', evt => {
      if (window.hljs) window.hljs.highlightAll()
    })
  }

  randomId (length = 10, noNum = true) {
    let result = ''
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    if (!noNum) chars += '0123456789'
    const charsLength = chars.length
    let counter = 0
    while (counter < length) {
      result += chars.charAt(Math.floor(Math.random() * charsLength))
      counter += 1
    }
    return result
  }

  async fetchRender (body) {
    const resp = await fetch(this.renderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body
    })
    if (!resp.ok) throw new Error('Response status: ' + resp.status)
    return await resp.text()
  }

  async createComponent (body, selector, asChild) {
    const html = await this.fetchRender(body)
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    return tpl.content.firstElementChild
  }

  async replaceWithComponent (body, selector) {
    const cmp = await this.createComponent(body)
    const el = document.querySelector(selector)
    if (!el) return
    el.replaceWith(cmp)
    return cmp.getAttribute('id')
  }

  async addComponent (body, selector) {
    const cmp = await this.createComponent(body)
    const el = document.querySelector(selector)
    if (!el) return
    el.appendChild(cmp)
    return cmp.getAttribute('id')
  }

  async t (...params) {
    let [text, ...value] = params
    value = value.join('|')
    const body = '<c:t value="' + value + '">' + text + '</c:t>'
    return await this.fetchRender(body)
  }

  async copyToClipboard (selector) {
    const el = document.querySelector(selector)
    if (!el) return
    const content = el.textContent
    await navigator.clipboard.writeText(content)
  }

  async loadScript (url) {
    const script = document.createElement('script')
    script.src = url
    script.type = 'text/javascript'
    document.getElementsByTagName('body')[0].appendChild(script)
  }

  isAsync (fn) {
    return fn.constructor.name === 'AsyncFunction'
  }

  postForm (params, path, method) {
    method = method ?? 'POST'
    const form = document.createElement('form')
    form.setAttribute('method', method)
    if (path) form.setAttribute('action', path)

    for (const key in params) {
      const input = document.createElement('input')
      input.setAttribute('type', 'hidden')
      input.setAttribute('name', key)
      input.setAttribute('value', params[key])
      form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
  }
}

const wmpa = new Wmpa() // eslint-disable-line no-unused-vars
