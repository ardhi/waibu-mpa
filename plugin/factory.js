import { stripHtml } from 'string-strip-html'
import resolveResource, { filecheck } from '../lib/resolve-resource.js'
import path from 'path'
import minifier from 'html-minifier-terser'

async function factory (pkgName) {
  const me = this

  return class WaibuMpa extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'wmpa'
      this.dependencies = ['waibu', 'waibu-static', 'bajo-template']
      this.config = {
        title: 'Multi Page Webapp',
        waibu: {
          prefix: ''
        },
        mountMainAsRoot: true,
        page: {
          charset: 'utf-8',
          cacheMaxAge: 0,
          insertWarning: false
        },
        darkMode: {
          set: null,
          qsKey: 'dark-mode'
        },
        intl: {
          detectors: ['qs']
        },
        session: {
          secret: 'f703a74b884b539e78c642a5369fe538',
          cookieName: 'sid',
          cookie: {
            secure: 'auto'
          },
          saveUninitialized: false
        },
        emoji: true,
        viewEngine: {
          cacheMaxAge: 0,
          layout: {
            default: 'waibuMpa:/default.html',
            fallback: true
          }
        },
        theme: {
          set: null,
          autoInsert: {
            css: true,
            meta: true,
            scripts: true,
            inlineScript: true,
            inlineCss: true
          },
          component: {
            unknownTag: 'replaceWithDiv',
            cacheMaxAgeDur: '1m'
          }
        },
        iconset: {
          set: null,
          autoInsert: {
            css: true,
            scripts: true,
            inlineScript: true,
            inlineCss: true
          }
        },
        concatResource: {
          cacheMaxAge: 0,
          excluded: [],
          css: false,
          scripts: false
        },
        cheerio: {
          loadOptions: {
            xml: {
              xmlMode: false,
              decodeEntities: false,
              recognizeSelfClosing: true
            }
          }
        },
        prettier: {
          parser: 'html',
          printWidth: 120
        },
        minifier: {
          removeAttributeQuotes: true,
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeCDATASectionsFromCDATA: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          decodeEntities: true,
          collapseBooleanAttributes: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true
        },
        multipart: {},
        cors: {},
        helmet: {
          contentSecurityPolicy: false
        },
        compress: false,
        rateLimit: false,
        disabled: []
      }
    }

    init = async () => {
      const { trim } = this.lib._
      this.config.waibu = this.config.waibu ?? {}
      this.config.waibu.prefix = trim(this.config.waibu.prefix, '/')
    }

    arrayToAttr = (array = [], delimiter = ' ') => {
      return array.join(delimiter)
    }

    attrToArray = (text = '', delimiter = ' ') => {
      const { map, trim, without, isArray } = this.lib._
      if (text === true) text = ''
      if (isArray(text)) text = text.join(delimiter)
      return without(map(text.split(delimiter), i => trim(i)), '', undefined, null)
    }

    attrToObject = (text = '', delimiter = ';', kvDelimiter = ':') => {
      const { camelCase, isPlainObject } = this.lib._
      const result = {}
      if (isPlainObject(text)) text = this.objectToAttr(text)
      if (text.slice(1, 3) === '%=') return text
      const array = this.attrToArray(text, delimiter)
      array.forEach(item => {
        const [key, val] = this.attrToArray(item, kvDelimiter)
        result[camelCase(key)] = val
      })
      return result
    }

    base64JsonDecode = (data = 'e30=') => {
      return JSON.parse(Buffer.from(data, 'base64'))
    }

    base64JsonEncode = (data) => {
      return Buffer.from(JSON.stringify(data)).toString('base64')
    }

    buildUrl = ({ exclude = [], prefix = '?', base, url = '', params = {}, prettyUrl }) => {
      const { qs } = this.app.waibu
      const { forOwn, omit, isEmpty } = this.lib._
      const qsKey = this.app.waibu.config.qsKey
      let path
      let hash
      let query
      [path = '', hash = ''] = url.split('#')
      if (hash.includes('?')) [hash, query] = hash.split('?')
      else [path, query] = path.split('?')
      query = qs.parse(query) ?? {}
      forOwn(params, (v, k) => {
        const key = qsKey[k] ?? k
        query[key] = v
      })
      const id = query.id
      if (prettyUrl) delete query.id
      query = prefix + qs.stringify(omit(query, exclude))
      if (!isEmpty(hash)) hash = '#' + hash
      if (!base) return path + query + hash
      const parts = path.split('/')
      if (base) {
        parts.pop()
        parts.push(base)
      }
      if (prettyUrl && id) parts.push(id)
      return parts.join('/') + query + hash
    }

    getAppTitle = (name) => {
      const { getPlugin } = this.app.bajo
      const { get } = this.lib._
      const plugin = getPlugin(name, true)
      if (!plugin) return
      return get(plugin, 'config.waibu.title', plugin.title)
    }

    getResource (name) {
      const subNses = ['layout', 'template', 'partial']
      const { ns, path, subNs, subSubNs, qs } = this.app.bajo.breakNsPath(name)
      const plugin = this.app.bajo.getPlugin(ns)
      const dir = `${plugin.dir.pkg}/waibuMpa`
      if (!subNses.includes(subNs)) throw this.error('unknownResource%s', name)
      const fullPath = subSubNs ? `${dir}/${subSubNs}/${subNs}${path}` : `${dir}/${subNs}${path}`
      return { ns, subNs, subSubNs, path, qs, fullPath }
    }

    getSessionId = async (rawCookie, secure) => {
      const { importPkg } = this.app.bajo
      const fcookie = await importPkg('waibu:@fastify/cookie')
      const cookie = fcookie.parse(rawCookie) ?? {}
      const key = this.config.session.cookieName
      const text = cookie[key] ?? ''
      if (secure) return text
      return text.split('.')[0]
    }

    getViewEngine = (ext) => {
      const { find } = this.lib._
      const ve = find(this.viewEngines, v => v.fileExts.includes(ext))
      return ve ?? find(this.viewEngines, v => v.name === 'default')
    }

    groupAttrs = (attribs = {}, keys = [], removeEmpty = true) => {
      const { isString, filter, omit, kebabCase, camelCase, isEmpty } = this.lib._
      if (isString(keys)) keys = [keys]
      const attr = { _: {} }
      for (const a in attribs) {
        for (const k of keys) {
          if (a === k) {
            attr._[k] = attribs[a]
            continue
          }
          attr[k] = attr[k] ?? {}
          attr[k].class = attr[k].class ?? []
          attr[k].style = attr[k].style ?? {}
          const _k = kebabCase(k)
          let name = camelCase(kebabCase(a).slice(_k.length + 1))
          if (a.includes('@') || a.includes(':')) name = a.slice(_k.length + 1)
          if (!kebabCase(a).startsWith(k + '-')) {
            if (!keys.includes(a)) {
              attr._[a] = attribs[a]
              if (a === 'class' && isString(attribs[a])) attr._.class = this.attrToArray(attr._.class)
              if (a === 'style' && isString(attribs[a])) attr._.style = this.attrToObject(attr._.style)
            }
            continue
          }
          attr[k][name] = attribs[a]
          if (name === 'class' && isString(attribs[a])) attr[k].class = this.attrToArray(attr[k].class)
          if (name === 'style' && isString(attribs[a])) attr[k].style = this.attrToObject(attr[k].style)
        }
      }
      const deleted = filter(Object.keys(attr._), m => {
        let match
        m = kebabCase(m)
        for (const k of keys) {
          if (m.startsWith(k + '-')) match = true
        }
        return match
      })
      attr._ = omit(attr._, deleted)
      for (const k of keys) {
        const item = attr[k]
        if (removeEmpty && !attr._[k] && Object.keys(item).length === 2 && isEmpty(item.class) && isEmpty(item.style)) delete attr[k]
      }
      return attr
    }

    minify = async (text) => {
      return await minifier.minify(text, {
        collapseWhitespace: true
      })
    }

    // Based on: https://github.com/siddharth-sunchu/native-methods/blob/master/JSONStringfy.js
    jsonStringify = (obj, replacer, space) => {
      const {
        isNumber, isString, isBoolean, isUndefined, isFunction, isSymbol,
        isNull, isDate, isArray, isPlainObject
      } = this.lib._

      if (replacer !== true) return JSON.stringify(obj, replacer, space)

      const isNotNumber = (value) => {
        return isNumber(value) && isNaN(value)
      }

      const isInfinity = (value) => {
        return isNumber(value) && !isFinite(value)
      }

      const restOfDataTypes = (value) => {
        return isNumber(value) || isString(value) || isBoolean(value)
      }

      const ignoreDataTypes = (value) => {
        return isUndefined(value) || isFunction(value) || isSymbol(value)
      }

      const nullDataTypes = (value) => {
        return isNotNumber(value) || isInfinity(value) || isNull(value)
      }

      const arrayValuesNullTypes = (value) => {
        return isNotNumber(value) || isInfinity(value) || isNull(value) || ignoreDataTypes(value)
      }

      const removeComma = (str) => {
        const tempArr = str.split('')
        tempArr.pop()
        return tempArr.join('')
      }

      if (ignoreDataTypes(obj)) {
        return undefined
      }

      if (isDate(obj)) {
        return `"${obj.toISOString()}"`
      }

      if (nullDataTypes(obj)) {
        return `${null}`
      }

      if (isSymbol(obj)) {
        return undefined
      }

      if (restOfDataTypes(obj)) {
        const passQuotes = isString(obj) ? "'" : ''
        return `${passQuotes}${obj}${passQuotes}`
      }

      if (isArray(obj)) {
        let arrStr = ''
        obj.forEach((eachValue) => {
          arrStr += arrayValuesNullTypes(eachValue) ? this.jsonStringify(null, replacer, space) : this.jsonStringify(eachValue, replacer, space)
          arrStr += ','
        })

        return '[' + removeComma(arrStr) + ']'
      }

      if (isPlainObject(obj)) {
        let objStr = ''

        const objKeys = Object.keys(obj)

        objKeys.forEach((eachKey) => {
          const eachValue = obj[eachKey]
          if (eachKey.includes('-')) eachKey = `'${eachKey}'`
          objStr += (!ignoreDataTypes(eachValue)) ? `${eachKey}:${this.jsonStringify(eachValue, replacer, space)},` : ''
        })
        return '{' + removeComma(objStr) + '}'
      }
    }

    objectToAttr = (obj = {}, delimiter = ';', kvDelimiter = ':') => {
      const { forOwn, kebabCase } = this.lib._
      const result = []
      forOwn(obj, (v, k) => {
        result.push(`${kebabCase(k)}${kvDelimiter} ${v ?? ''}`)
      })
      return result.join(delimiter + ' ')
    }

    // based on: https://github.com/kyleparisi/pagination-layout/blob/master/pagination-layout-be.js
    paginationLayout = (totalItems, itemsPerPage, currentPage) => {
      const { isPlainObject } = this.lib._
      if (isPlainObject(totalItems)) {
        currentPage = totalItems.page
        itemsPerPage = totalItems.limit
        totalItems = totalItems.count
      }
      function last (array) {
        const length = array == null ? 0 : array.length
        return length ? array[length - 1] : undefined
      }

      const pages = Math.ceil(totalItems / itemsPerPage)

      if (!totalItems) return []

      // default pages when we only have <= 4 pages
      if ([1, 2, 3, 4, 5, 6, 7].indexOf(pages) !== -1) {
        const defaultView = []
        for (let i = 1; i <= pages; i++) {
          defaultView.push(i)
        }
        return defaultView
      }

      currentPage = currentPage || 1

      const boundary = 2
      let boundaryMiddle = false

      // if current page is sufficiently in the middle, boundary is +1 and -1
      if (
        currentPage > 3 &&
        (pages - currentPage >= 3 ||
        pages - currentPage === 1)
      ) {
        boundaryMiddle = true
      }

      if (currentPage > pages) {
        currentPage = pages
      }

      if (currentPage < 1) {
        currentPage = 1
      }

      const output = []

      if (!boundaryMiddle) {
        // count up to boundary amount from current page
        for (let i = currentPage; i <= pages; i++) {
          if (output.length === boundary) {
            break
          }
          output.push(i)
        }

        // if we do not fill the boundary count, count down from current page
        if (output.length < boundary) {
          for (let i = currentPage - 1; i > pages - boundary; i--) {
            output.unshift(i)
          }
        }
      } else {
        // count up 1 and down 1 from current page
        output.push(currentPage - 1)
        output.push(currentPage)
        output.push(currentPage + 1)
      }

      // attach last page to nav when only 1 away
      if (pages - last(output) === 1) {
        output.push(pages)
      }

      // attach first page to when only 1 away
      if (output[0] === 2) {
        output.unshift(1)
      }

      // attach first page to when only 2 away
      if (currentPage === 3) {
        output.unshift(2)
        output.unshift(1)
      }

      // put lowest page and ... when we exceed the boundary
      if (
        currentPage > 3 &&
        pages > boundary &&
        pages > 7
      ) {
        output.unshift(1, '...')
      }

      if (output.length < 7) {
        let need = 7 - output.length
        // should count down
        if (pages === last(output)) {
          for (let i = 1; i <= need; i++) {
            output.splice(2, 0, output[2] - 1)
          }
        } else if (!boundaryMiddle) { // should count up
          // remove "...", [last page]
          need = need - 2
          for (let i = 1; i <= need; i++) {
            output.push(last(output) + 1)
          }
        }
      }

      // done if the final page is in view
      if (!(pages - last(output) > 1)) {
        return output
      }

      // attach final page to view
      output.push('...')
      output.push(pages)
      return output
    }

    renderString = async (text, params = {}, opts = {}) => {
      const { importModule } = this.app.bajo
      const buildLocals = await importModule('waibu:/lib/build-locals.js')
      const locals = await buildLocals.call(this, { tpl: null, params, opts })
      const ve = this.getViewEngine(opts.ext)
      return await ve.renderString(text, locals, opts)
    }

    render = async (tpl, params = {}, opts = {}) => {
      const { importModule } = this.app.bajo
      const buildLocals = await importModule('waibu:/lib/build-locals.js')
      const locals = await buildLocals.call(this, { tpl, params, opts })
      const ext = path.extname(tpl)
      if (['.json', '.js', '.css'].includes(ext)) opts.partial = true
      opts.ext = ext
      opts.cacheMaxAge = this.config.page.cacheMaxAgeDur
      const viewEngine = this.getViewEngine(ext)
      return await viewEngine.render(tpl, locals, opts)
    }

    resolveLayout = (item = '', opts = {}) => {
      function fallbackHandler ({ file, exts, ns, subSubNs, type, theme }) {
        const dir = ''
        const base = 'default'
        if (!this.config.viewEngine.layout.fallback) return false
        // check main: theme specific
        if (theme && !file) {
          const check = `${this.app.main.dir.pkg}/${this.name}/${type}/_${theme.name}`
          file = filecheck.call(this, { dir, base, exts, check })
        }
        // check mail: common
        if (!file) {
          const check = `${this.app.main.dir.pkg}/${this.name}/${type}`
          file = filecheck.call(this, { dir, base, exts, check })
        }
        // check fallback: common
        if (!file) file = filecheck.call(this, { dir, base, exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}${type}` })
        // check general fallback
        if (!file) file = filecheck.call(this, { dir, base, exts, check: `${this.dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}${type}` })
        return file
      }
      return resolveResource.call(this, 'layout', item, opts, fallbackHandler)
    }

    resolvePartial = (item = '', opts = {}) => {
      return resolveResource.call(this, 'partial', item, opts)
    }

    resolveTemplate = (item = '', opts = {}) => {
      return resolveResource.call(this, 'template', item, opts)
    }

    stripHtmlTags = (html, options = {}) => {
      const { result } = stripHtml(html, options)
      return result
    }

    urlToBreadcrumb = (url, { delimiter, returnParts, base = '', handler, handlerScope, handlerOpts } = {}) => {
      const { trim, map, last, without } = this.lib._
      const { routePath } = this.app.waibu

      function defHandler (item) {
        return item
      }

      function breakPath (route, delimiter = '/') {
        route = trim(route, delimiter)
        const parts = without(route.split(delimiter), '')
        const routes = []
        for (const p of parts) {
          const l = last(routes)
          routes.push(l ? `${l}${delimiter}${p}` : p)
        }
        return routes
      }

      url = routePath(url)
      const route = trim(url.replace(base, ''), '/')
      const parts = breakPath.call(this, route, delimiter)
      if (returnParts) return parts
      if (!handler) handler = defHandler
      if (!handlerScope) handlerScope = this
      const result = map(parts, (r, idx) => {
        const f = `${base}/${r}`
        const opts = parts.length > 2 && (idx === parts.length - 2) && handlerOpts.hrefRebuild ? { hrefRebuild: handlerOpts.hrefRebuild } : {}
        return handler.call(handlerScope, f, url, opts)
      })
      return result
    }
  }
}

export default factory
