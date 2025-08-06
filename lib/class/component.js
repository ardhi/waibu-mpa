import baseFactory from './base-factory.js'
import path from 'path'

/**
 * Represents a Component that handles dynamic tag building, rendering, and other utilities.
 */
class Component {
  /**
   * Creates a new Component instance.
   * @param {Object} [options={}] - The options for the component.
   * @param {Object} options.plugin - The plugin instance.
   * @param {Object} options.$ - The jQuery-like instance.
   * @param {Object} options.theme - The theme configuration.
   * @param {Object} options.iconset - The iconset configuration.
   * @param {Object} options.locals - The local variables.
   * @param {Object} options.reply - The reply object.
   * @param {Object} options.req - The request object.
   */
  constructor ({ plugin, $, theme, iconset, locals, reply, req, scriptBlock, styleBlock } = {}) {
    const { get } = plugin.app.bajo.lib._
    this.baseFactory = baseFactory
    this.plugin = plugin
    this.$ = $
    this.theme = theme
    this.iconset = iconset
    this.locals = locals
    this.reply = reply
    this.req = req
    this.cacheMaxAge = get(plugin, 'app.waibuMpa.config.theme.component.cacheMaxAgeDur', 0)
    this.namespace = 'c:'
    this.noTags = []
    this.scriptBlock = scriptBlock
    this.styleBlock = styleBlock
    this.factory = {}
  }

  addScriptBlock = (type, block) => {
    if (!block) {
      block = type
      type = 'root'
    }
    if (typeof block === 'string') block = [block]
    this.scriptBlock[type] = this.scriptBlock[type] ?? []
    this.scriptBlock[type].push(...block)
  }

  addStyleBlock = (type, block) => {
    if (!block) {
      block = type
      type = 'root'
    }
    if (typeof block === 'string') block = [block]
    this.styleBlock[type] = this.styleBlock[type] ?? []
    this.styleBlock[type].push(...block)
  }

  /**
   * Loads base factories dynamically from the file system.
   * @async
   */

  loadBaseFactories = async () => {
    const { camelCase } = this.plugin.lib._
    const { importModule } = this.plugin.app.bajo
    const { fastGlob } = this.plugin.lib
    const pattern = `${this.plugin.app.waibuMpa.dir.pkg}/lib/class/factory/*.js`
    const files = await fastGlob(pattern)
    for (const file of files) {
      const mod = await importModule(file)
      const name = camelCase(path.basename(file, '.js'))
      this.factory[name] = mod
    }
  }

  /**
   * Retrieves a builder class or instance for a specific method.
   * @async
   * @param {string} method - The method name to retrieve the builder for.
   * @returns {Promise<Function|Object>} The builder class or instance.
   */
  getBuilder = async (method) => {
    const { isClass } = this.plugin.lib.aneka
    let Builder = this.factory[method]
    if (!isClass(Builder)) Builder = await Builder.call(this)
    return Builder
  }

  /**
   * Determines the method to use based on the provided parameters.
   * @param {Object} params - The parameters containing the method information.
   * @returns {string} The determined method name.
   */
  getMethod = (params) => {
    let method = params.ctag
    if (!this.factory[method]) method = 'any'
    return method
  }

  /**
   * Builds a tag with the given parameters and options.
   * @async
   * @param {Object} [params={}] - The parameters for the tag.
   * @param {Object} [opts={}] - Additional options for building the tag.
   * @returns {Promise<string|boolean>} The rendered HTML or `false` if the build fails.
   */
  buildTag = async (params = {}, opts = {}) => {
    const { sprintf } = this.plugin.lib
    const { compile } = this.plugin.app.bajoTemplate
    const { isEmpty, merge, uniq, without } = this.plugin.lib._
    params.ctag = params.tag
    const method = this.getMethod(params)
    if (opts.attr) params.attr = merge({}, opts.attr, params.attr)
    this.normalizeAttr(params)
    params.attr.content = params.attr.content ?? ''
    if (params.attr.content.includes('%s')) params.html = sprintf(params.attr.content, params.html)
    else if (isEmpty(params.html)) params.html = params.attr.content
    await this.iconAttr(params, method)
    await this.beforeBuildTag(method, params)
    const Builder = await this.getBuilder(method)
    const builder = new Builder({ component: this, params })
    const resp = await builder.build()
    if (resp === false) {
      return false
    }

    await this.afterBuildTag(method, params)
    params.attr.class = without(uniq(params.attr.class), undefined, null, '')
    if (isEmpty(params.attr.class)) delete params.attr.class
    if (isEmpty(params.attr.style)) delete params.attr.style
    if (isEmpty(params.html)) return await this.render(params)

    const merged = merge({}, params.locals, { attr: params.attr })
    const result = await compile(params.html, merged, { ttl: this.cacheMaxAge })
    params.html = result
    return await this.render(params)
  }

  /**
   * Normalizes the attributes of the given parameters.
   * @param {Object} [params={}] - The parameters containing attributes to normalize.
   * @param {Object} [opts={}] - Additional options for normalization.
   */
  normalizeAttr = (params = {}, opts = {}) => {
    const { without, keys, isString, isArray } = this.plugin.lib._
    const { generateId } = this.plugin.app.bajo
    params.attr = params.attr ?? {}
    params.attr.class = this.plugin.app.waibuMpa.attrToArray(params.attr.class)
    params.attr.style = this.plugin.app.waibuMpa.attrToObject(params.attr.style)
    if (isString(opts.cls)) params.attr.class.push(opts.cls)
    else if (isArray(opts.cls)) params.attr.class.push(...opts.cls)
    if (opts.tag) params.tag = opts.tag
    if (opts.autoId) params.attr.id = isString(params.attr.id) ? params.attr.id : generateId('alpha')
    for (const k of without(keys(opts), 'cls', 'tag', 'autoId')) {
      params.attr[k] = opts[k]
    }
    params.html = params.html ?? ''
  }

  /**
   * Renders the final HTML for the given parameters.
   * @async
   * @param {Object} [params={}] - The parameters for rendering.
   * @returns {Promise<string>} The rendered HTML.
   */
  render = async (params = {}) => {
    const { omit, isEmpty, merge, kebabCase, isArray } = this.plugin.lib._
    const { attribsStringify } = this.plugin.app.waibuMpa
    params.attr = params.attr ?? {}

    params.tag = params.attr.tag ?? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(params.tag) ? params.tag : kebabCase(params.tag)
    params.attr = omit(params.attr, ['tag', 'content'])
    params.html = params.html ?? ''
    params.attrs = attribsStringify(params.attr)
    if (!isEmpty(params.attrs)) params.attrs = ' ' + params.attrs
    let html = isArray(params.html) ? params.html.join('\n') : params.html
    if (!params.noTag) {
      html = params.selfClosing ? `<${params.tag}${params.attrs}/>` : `<${params.tag}${params.attrs}>${params.html}</${params.tag}>`
      const method = this.getMethod(params)
      if (this.factory[method]) { // static method on Builder
        const Builder = await this.getBuilder(method)
        if (Builder.after) {
          html = (await Builder.after.call(this, merge({}, params, { result: html }))) ?? html
        }
      }
    } else if (!this.noTags.includes(params.attr.octag)) this.noTags.push(params.attr.octag)
    if (params.prepend) html = `${params.prepend}${html}`
    if (params.append) html += params.append
    return html
  }

  /**
   * Processes icon-related attributes and appends them to the HTML.
   * @async
   * @param {Object} [params={}] - The parameters containing icon attributes.
   * @param {string} method - The method name.
   */
  iconAttr = async (params = {}, method) => {
    if (['modal', 'toast'].includes(method)) return
    const { groupAttrs } = this.plugin.app.waibuMpa
    const { merge } = this.plugin.lib._
    for (const k in params.attr) {
      const v = params.attr[k]
      if (!['icon', 'iconEnd'].includes(k)) continue
      const group = groupAttrs(params.attr, ['icon', 'iconEnd'])
      const _params = { attr: merge(k.endsWith('End') ? group.iconEnd : group.icon, { name: v }) }
      const Builder = this.factory.icon
      const builder = new Builder({ component: this, params: _params })
      await builder.build()
      const icon = await this.render(_params)
      params.html = k.endsWith('End') ? `${params.html} ${icon}` : `${icon} ${params.html}`
      delete params.attr[k]
    }
  }

  /**
   * Builds the `<option>` elements for a `<select>` tag.
   * @param {Object} params - The parameters containing options and values.
   * @returns {string} The generated `<option>` elements.
   */
  buildOptions = (params) => {
    const { has, omit, find, isPlainObject, isArray } = this.plugin.lib._
    const { attrToArray } = this.plugin.app.waibuMpa
    const items = []
    if (!has(params.attr, 'options')) return
    let values = attrToArray(params.attr.value)
    if (!has(params.attr, 'multiple') && values.length > 0) values = [values[0]]
    const options = isArray(params.attr.options) ? params.attr.options : attrToArray(params.attr.options)
    for (const opt of options) {
      let val
      let text
      if (isPlainObject(opt)) {
        val = opt.value
        text = opt.text
      } else [val, text] = opt.split('|')
      const sel = find(values, v => val === v)
      items.push(`<option value="${val}"${sel ? ' selected' : ''}>${this.req.t(text ?? val)}</option>`)
    }
    params.attr = omit(params.attr, ['options'])
    return items.join('\n')
  }

  /**
   * Builds a URL with the given parameters.
   * @param {Object} options - The options for building the URL.
   * @param {Array<string>} [options.exclude] - Keys to exclude from the URL.
   * @param {string} [options.prefix] - The prefix for the URL.
   * @param {string} [options.base] - The base URL.
   * @param {string} [options.url] - The URL to modify.
   * @param {Object} [options.params={}] - Query parameters to include.
   * @param {boolean} [options.prettyUrl] - Whether to generate a pretty URL.
   * @returns {string} The built URL.
   */
  buildUrl = ({ exclude, prefix, base, url, params = {}, prettyUrl }) => {
    const { isEmpty } = this.plugin.lib._
    const { buildUrl } = this.plugin.app.waibuMpa
    url = url ?? (isEmpty(this.req.referer) ? this.req.url : this.req.referer)
    return buildUrl({ exclude, prefix, base, url, params, prettyUrl })
  }

  /**
   * Builds a sentence with optional rendering and minification.
   * @async
   * @param {string|string[]} sentence - The sentence or array of sentences to build.
   * @param {Object} [params={}] - Parameters for rendering the sentence.
   * @param {Object} [extra={}] - Extra options such as wrapping or minification.
   * @returns {Promise<string>} The built sentence.
   */
  buildSentence = async (sentence, params = {}, extra = {}) => {
    if (Array.isArray(sentence)) sentence = sentence.join(' ')
    const { minify, renderString } = this.plugin.app.waibuMpa
    if (extra.wrapped) sentence = '<w>' + sentence + '</w>'
    const opts = {
      partial: true,
      ext: params.ext ?? '.html',
      req: this.req,
      reply: this.reply
    }
    let html = await renderString(sentence, params, opts)
    if (extra.wrapped) html = html.slice(3, html.length - 4)
    if (extra.minify) html = await minify(html)
    return html
  }

  /**
   * Hook executed before building a tag.
   * @param {string} tag - The tag name.
   * @param {Object} params - The parameters for the tag.
   */
  beforeBuildTag = (tag, params) => {}

  /**
   * Hook executed after building a tag.
   * @param {string} tag - The tag name.
   * @param {Object} params - The parameters for the tag.
   */
  afterBuildTag = (tag, params) => {}

  /**
   * Builds a child tag based on a detector attribute.
   * @async
   * @param {string} detector - The attribute to detect child tags.
   * @param {Object} options - Options for building the child tag.
   * @param {string} [options.tag] - The tag name.
   * @param {Object} options.params - The parameters for the child tag.
   * @param {string} [options.inner] - Inner HTML for the child tag.
   */
  buildChildTag = async (detector, { tag, params, inner }) => {
    const { has, pickBy, omit, keys } = this.plugin.lib._
    if (has(params.attr, detector)) {
      const [prefix] = detector.split('-')
      const attr = {}
      const html = tag ? params.attr[detector] : undefined
      tag = tag ?? prefix
      const picked = pickBy(params.attr, (v, k) => k.startsWith(`${prefix}-`))
      for (const k in picked) {
        attr[k.slice(prefix.length + 1)] = picked[k]
      }
      const child = await this.buildTag({ tag, params: { attr, html } })
      params.html += `\n${child}`
      const excluded = [detector, ...keys(picked)]
      params.attr = omit(params.attr, excluded)
    }
  }
}

export default Component
