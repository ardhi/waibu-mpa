/* global _ */

class Wmpa {
  constructor () {
    this.prefixVirtual = '<%= prefix.virtual %>'
    this.prefixAsset = '<%= prefix.asset %>'
    this.prefixMain = '<%= prefix.main %>'
    this.accessTokenUrl = '<%= accessTokenUrl %>'
    this.renderUrl = '<%= renderUrl %>'
    this.apiPrefix = '<%= api.prefix %>'
    this.apiExt = '<%= api.ext %>'
    this.apiHeaderKey = '<%= api.headerKey %>'
    this.apiDataKey = '<%= api.dataKey %>'
    this.init()
  }

  init () {
    window.addEventListener('load', evt => {
      if (window.hljs) window.hljs.highlightAll()
    })
    fetch(this.accessTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }
    }).then(resp => {
      return resp.text()
    }).then(token => {
      this.accessToken = token
    })
  }

  randomRange (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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
      headers: { 'Content-Type': 'text/plain', 'Waibu-Referer': window.location.href },
      body
    })
    if (!resp.ok) throw new Error('Response status: ' + resp.status)
    return await resp.text()
  }

  async fetchApi (endpoint, opts, filter = {}) {
    opts = opts ?? {}
    endpoint = '/' + this.apiPrefix + endpoint + this.apiExt
    opts.headers = opts.headers ?? {}
    opts.headers[this.apiHeaderKey] = this.accessToken
    const qs = new URLSearchParams(filter)
    endpoint += '?' + qs.toString()
    const resp = await fetch(endpoint, opts)
    const result = await resp.json()
    if (resp.ok) return result[this.apiDataKey]
    // console.error(result)
    return []
  }

  async createComponent (body, selector, asChild) {
    if (_.isArray(body)) body = body.join('\n')
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

  async addComponent (body, selector = 'body') {
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

  async copyToClipboard (content, isSelector) {
    if (isSelector) {
      try {
        const el = document.querySelector(content)
        content = el.textContent
      } catch (err) {
        await this.notify('Invalid selector!', { type: 'danger' })
        return
      }
    }
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

  parseValue (value, type) {
    try {
      if (['integer', 'smallint'].includes(type)) value = parseInt(value)
      else if (['float', 'double'].includes(type)) value = parseFloat(value)
      else if (['datetime', 'date', 'time'].includes(type)) value = Date.parse(value)
      else if (['array', 'object'].includes(type)) value = JSON.parse(value)
    } catch (err) {}
    return value
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
      input.setAttribute('value', params[key]) // TODO: sanitizing
      form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
  }

  async delay (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}

const wmpa = new Wmpa() // eslint-disable-line no-unused-vars
