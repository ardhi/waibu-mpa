/* global _ */

class Wmpa {
  constructor () {
    this.lang = '<%= _meta.lang %>'
    this.prefixVirtual = '<%= prefix.virtual %>'
    this.prefixAsset = '<%= prefix.asset %>'
    this.prefixMain = '<%= prefix.main %>'
    this.accessTokenUrl = '<%= accessTokenUrl %>'
    this.renderUrl = '<%= renderUrl %>'
    this.apiPrefix = '<%= api.prefix %>'
    this.apiExt = '<%= api.ext %>'
    this.apiHeaderKey = '<%= api.headerKey %>'
    this.apiDataKey = '<%= api.dataKey %>'
    this.apiRateLimitCount = 0
    this.apiRateLimitDelay = <%= api.rateLimitDelay %>
    this.apiRateLimitRetry = <%= api.rateLimitRetry %>
    this.formatOpts = <%= _jsonStringify(formatOpts, true) %>
    this.fetchingApi = {}
    this.init()
  }

  init () {
    window.addEventListener('load', evt => {
      if (window.hljs) window.hljs.highlightAll()
    })
    document.addEventListener('alpine:initializing', () => {
      Alpine.store('wmpa', {
        loading: false,
        reqAborted: null
      })
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

  isSet (value) {
    return ![undefined, null].includes(value)
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
    if (_.isArray(body)) body = body.join('\n')
    const resp = await fetch(this.renderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'Waibu-Referer': window.location.href },
      body
    })
    if (!resp.ok) throw new Error('Response status: ' + resp.status)
    return await resp.text()
  }

  async fetchApi (endpoint, opts, filter = {}) {
    Alpine.store('wmpa').reqAborted = null
    const oendpoint = endpoint
    const oopts = _.cloneDeep(opts)
    const ofilter = _.cloneDeep(filter)
    let options = _.cloneDeep(opts) ?? {}
    options.fetching = options.fetching ?? {}
    if (options.fetching) {
      this.fetchingApi[oendpoint] = this.fetchingApi[oendpoint] ?? {}
      if (this.fetchingApi[oendpoint].status === 'fetching') return
      this.fetchingApi[oendpoint].status = 'fetching'
      delete options.fetching
    }
    Alpine.store('wmpa').loading = true
    endpoint = '/' + this.apiPrefix + endpoint + this.apiExt
    options.headers = options.headers ?? {}
    options.headers[this.apiHeaderKey] = this.accessToken
    const abortCtrl = new AbortController()
    options.signal = abortCtrl.signal
    this.fetchingApi[oendpoint].abortCtrl = abortCtrl
    const { mapSearch } = filter
    if (mapSearch) {
      Alpine.store('mapSearch').busy = mapSearch
      delete filter.mapSearch
    }
    const qs = new URLSearchParams(filter)
    endpoint += '?' + qs.toString()
    const req = new Request(endpoint, options)
    let resp
    try {
      resp = await fetch(req)
      const result = await resp.json()
      delete this.fetchingApi[oendpoint]
      Alpine.store('wmpa').loading = false
      if (mapSearch) Alpine.store('mapSearch').busy = false
      if (resp.status >= 500) return []
      if (resp.ok) {
        this.apiRateLimitCount = 0
        return result[this.apiDataKey]
      }
      if (resp.status === 429) {
        this.apiRateLimitCount++
        if (this.apiRateLimitCount > this.apiRateLimitRetry) {
          this.apiRateLimitCount = 0
          return []
        }
        await this.delay(this.apiRateLimitDelay)
        return this.fetchApi(oendpoint, oopts, ofilter)
      } else return []
    } catch (err) {
      if (mapSearch) Alpine.store('mapSearch').busy = false
      if (req.signal.aborted) {
        Alpine.store('wmpa').reqAborted = oendpoint
        this.fetchingApi[oendpoint].status = 'abort:Request aborted'
      }
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        window.location.reload()
      }
      return []
    }
  }

  createComponentFromHtml (html, wrapper) {
    if (wrapper) html = '<' + wrapper + '>' + html + '</' + wrapper + '>'
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    return tpl.content.firstElementChild
  }

  getElement (selector) {
    return selector instanceof HTMLElement ? selector : document.querySelector(selector)
  }

  async createComponent (body, wrapper) {
    if (_.isArray(body)) body = body.join('\n')
    const html = await this.fetchRender(body)
    return this.createComponentFromHtml(html, wrapper)
  }

  replaceWithComponentHtml (html, selector, wrapper) {
    const cmp = this.createComponentFromHtml(html, wrapper)
    const el = this.getElement(selector)
    if (!el) return
    el.replaceWith(cmp)
    return cmp.getAttribute('id')
  }

  async replaceWithComponent (body, selector, wrapper) {
    let cmp
    if (_.isString(body) || _.isArray(body)) cmp = await this.createComponent(body, wrapper)
    else cmp = body
    const el = this.getElement(selector)
    if (!el) return
    el.replaceWith(cmp)
    return cmp.getAttribute('id')
  }

  addComponentHtml (html, selector = 'body', wrapper) {
    const cmp = this.createComponentFromHtml(html, wrapper)
    const el = this.getElement(selector)
    if (!el) return
    el.appendChild(cmp)
    return cmp.getAttribute('id')
  }

  async addComponent (body, selector = 'body', wrapper) {
    let cmp
    if (_.isString(body) || _.isArray(body)) cmp = await this.createComponent(body, wrapper)
    else cmp = body
    const el = this.getElement(selector)
    if (!el) return
    el.appendChild(cmp)
    return cmp.getAttribute('id')
  }

  alpineScope (selector) {
    if (!selector) selector = '#' + Alpine.store('map').id
    const el = document.querySelector(selector)
    if (!el) return
    return _.get(el, '_x_dataStack.0')
  }

  alpineScopeMethod (fnName, selector) {
    const scope = this.alpineScope(selector)
    if (!scope) return
    let [ns, method] = fnName.split('.')
    if (!method) return scope[ns].bind(scope)
    let obj = scope[ns]
    if (_.isFunction(obj)) {
      obj = obj()
      return obj[method].bind(obj)
    }
    return obj[method].bind(scope)
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
        await wbs.notify('Invalid selector!', { type: 'danger' })
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
    params._src = window.location.href
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

  formatSpeed (value) {
    let unit = 'kmh'
    if (Alpine.store('map').measure === 'nautical') {
      value = value / 1.852
      unit = 'kn'
    } else if (Alpine.store('map').measure === 'imperial') {
      value = value / 1.609
      unit = 'mph'
    }
    return [value, unit]
  }

  formatDistance (value) {
    let unit = 'km'
    if (Alpine.store('map').measure === 'nautical') {
      value = value / 1.852
      unit = 'nm'
    } else if (Alpine.store('map').measure === 'imperial') {
      value = value / 1.609
      unit = 'mi'
    }
    return [value, unit]
  }

  format (value, type, options = {}) {
    const { emptyValue = this.formatOpts.emptyValue } = options
    if ([undefined, null, ''].includes(value)) return emptyValue
    if (type === 'auto') {
      if (value instanceof Date) type = 'datetime'
    }
    if (['integer', 'smallint'].includes(type)) {
      value = parseInt(value)
      if (isNaN(value)) return emptyValue
      const setting = _.defaultsDeep(options.integer, this.formatOpts.integer)
      return new Intl.NumberFormat(this.lang, setting).format(value)
    }
    if (['float', 'double'].includes(type)) {
      value = parseFloat(value)
      if (isNaN(value)) return emptyValue
      if (wmapsUtil && options.longitude) return wmapsUtil.decToDms(value, { isLng: true })
      if (wmapsUtil && options.latitude) return wmapsUtil.decToDms(value)
      let unit
      if (options.speed) [value, unit] = this.formatSpeed(value)
      else if (options.distance) [value, unit] = this.formatDistance(value)
      const setting = _.defaultsDeep(options.float, this.formatOpts.float)
      return (new Intl.NumberFormat(this.lang, setting).format(value)) + (_.isEmpty(unit) ? '' : (' ' + unit))
    }
    if (['datetime', 'date'].includes(type)) {
      const setting = _.defaultsDeep(options[type], this.formatOpts[type])
      return new Intl.DateTimeFormat(this.lang, setting).format(new Date(value))
    }
    if (['time'].includes(type)) {
      const setting = _.defaultsDeep(options.time, this.formatOpts.time)
      return new Intl.DateTimeFormat(this.lang, setting).format(new Date('1970-01-01T' + value + 'Z'))
    }
    if (['array'].includes(type)) return value.join(', ')
    if (['object'].includes(type)) return JSON.stringify(value)
    return value
  }

  formatProps ({ props = {}, schema = {}, emptyValue = '-' }) {
    props = _.cloneDeep(props)
    for (const s in schema) {
      if (!_.has(props, s)) props[s] = null
    }
    for (const p in props) {
      const opts = _.cloneDeep(this.formatOpts)
      if (_.isFunction(schema[p])) props[p] = schema[p](props[p])
      else {
        const [type, subType] = (schema[p] ?? 'auto').split(':')
        if (subType) opts[subType] = true
        if (emptyValue) opts.emptyValue = emptyValue
        props[p] = this.format(props[p], type, opts)
      }
    }
    return props
  }

  formatTpl ({ props = {}, tpl = '', schema = {} }) {
    props = this.formatProps({ props, schema })
    const compiled = _.isFunction(tpl) ? tpl : _.template(tpl)
    return compiled(props)
  }

  mergeArrays (arr1, arr2) {
    return [...arr1.concat(arr2).reduce((m, o) => {
      m.set(o.member, Object.assign(m.get(o.member) || {}, o))
    }, new Map()).values()]
  }

  getAge (dt, fullView) {
    const secNum = Math.abs(dayjs().diff(dt, 's'))
    let hours = Math.floor(secNum / 3600)
    let days = Math.floor(hours / 24)
    hours = hours - (days * 24)
    let minutes = Math.floor((secNum - (days * 86400) - (hours * 3600)) / 60)
    let seconds = secNum - (days * 86400) - (hours * 3600) - (minutes * 60)

    if (hours < 10) { hours = '0' + hours }
    if (minutes < 10) { minutes = '0' + minutes }
    if (seconds < 10) { seconds = '0'+ seconds }
    if (!fullView) {
      let parts = minutes + ':' + seconds
      if (days === 0) {
        if (hours !== '00') return hours + ':' + parts
        return parts
      }
      return days + 'd ' + hours + ':' + parts
    }
    return days + 'd ' + hours + ':' + minutes + ':' + seconds
  }

  pascalCase (text) {
    return _.upperFirst(_.camelCase(text))
  }

  insertString (text, insertedText, index) {
    return text.slice(0, index) + insertedText + text.slice(index)
  }

  copyArray (arr = []) {
    return [...arr]
  }

  toBase64 (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1)
    }))
  }

  fromBase64 (str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  }
}

const wmpa = new Wmpa() // eslint-disable-line no-unused-vars
if (window._ && window._.VERSION) {
  window._.templateSettings.evaluate = /\{\%(.+?)\%\}/g
  window._.templateSettings.interpolate = /\{\%=(.+?)\%\}/g
  window._.templateSettings.escape = /\{\%-(.+?)\%\}/g
}
