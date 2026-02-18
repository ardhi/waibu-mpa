import { stripHtml } from 'string-strip-html'
import iconsetMappings from './lib/iconset-mappings.js'
import toolsFactory from './lib/class/tools.js'
import widgetFactory from './lib/class/widget.js'
import path from 'path'

// taken from: https://stackoverflow.com/questions/52928550/js-get-list-of-all-available-standard-html-tags
const tags = 'a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,slot,small,source,span,strong,style,sub,summary,sup,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr'

/**
 * Plugin factory
 *
 * @param {string} pkgName - NPM package name
 * @returns {class}
 */
async function factory (pkgName) {
  const me = this

  /**
   * WaibuMpa class
   *
   * @class
   */
  class WaibuMpa extends this.app.baseClass.Base {
    static htmlTags = tags.split(',')
    static iconsetMappings = iconsetMappings

    constructor () {
      super(pkgName, me.app)
      this.config = {
        appTitle: this.ns,
        waibu: {
          prefix: ''
        },
        waibuAdmin: {
          modelDisabled: ['session']
        },
        mountMainAsRoot: true,
        page: {
          charset: 'utf-8',
          cacheMaxAge: 0,
          insertWarning: false,
          usePluginTitle: false,
          scriptsAtEndOfBody: true
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
            secure: 'auto',
            maxAge: 86400 * 7 * 1000
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
            links: true,
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
            links: true,
            inlineScript: true,
            inlineCss: true
          }
        },
        concatResource: {
          cacheMaxAge: 0,
          excluded: [],
          css: false,
          scripts: false,
          links: false
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
      const { trim } = this.app.lib._
      this.config.waibu.prefix = trim(this.config.waibu.prefix, '/')
      await toolsFactory.call(this)
      await widgetFactory.call(this)
    }

    buildUrl = ({ exclude = [], prefix = '?', base, url = '', params = {}, prettyUrl }) => {
      const { parseObject } = this.app.lib
      const { qs } = this.app.waibu
      const { forOwn, omit, isEmpty } = this.app.lib._
      const qsKey = this.app.waibu.config.qsKey
      let path
      let hash
      let query
      [path = '', hash = ''] = url.split('#')
      if (hash.includes('?')) [hash, query] = hash.split('?')
      else [path, query] = path.split('?')
      query = parseObject(qs.parse(query) ?? {})
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

    getPluginTitle = (name, lang) => {
      const { getPlugin } = this.app.bajo
      const { get } = this.app.lib._
      const plugin = getPlugin(name, true)
      if (!plugin) return
      const text = get(plugin, 'config.waibuMpa.title', plugin.ns)
      return this.t(text, { lang })
    }

    getAppTitle = (lang) => {
      const { get } = this.app.lib._
      const text = get(this, 'config.appTitle', this.ns)
      return this.t(text, { lang })
    }

    getResource (name) {
      const subNses = ['layout', 'template', 'partial']
      const { ns, path, subNs, subSubNs, qs } = this.app.bajo.breakNsPath(name)
      const plugin = this.app.bajo.getPlugin(ns)
      const dir = `${plugin.dir.pkg}/extend/waibuMpa`
      if (!subNses.includes(subNs)) throw this.error('unknownResource%s', name)
      const fullPath = subSubNs ? `${dir}/${subSubNs}/${subNs}${path}` : `${dir}/${subNs}${path}`
      return { ns, subNs, subSubNs, path, qs, fullPath }
    }

    getSessionId = (rawCookie, secure) => {
      const cookieName = this.config.session.cookieName
      return this.webAppCtx.parseCookie(rawCookie)[cookieName]
    }

    getViewEngine = (ext) => {
      const { find } = this.app.lib._
      const ve = find(this.viewEngines, v => v.fileExts.includes(ext))
      return ve ?? find(this.viewEngines, v => v.name === 'default')
    }

    groupAttrs = (attribs = {}, keys = [], removeEmpty = true) => {
      const { isString, filter, omit, kebabCase, camelCase, isEmpty } = this.app.lib._
      const { attrToArray, attrToObject } = this.app.waibu
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
              if (a === 'class' && isString(attribs[a])) attr._.class = attrToArray(attr._.class)
              if (a === 'style' && isString(attribs[a])) attr._.style = attrToObject(attr._.style)
            }
            continue
          }
          attr[k][name] = attribs[a]
          if (name === 'class' && isString(attribs[a])) attr[k].class = attrToArray(attr[k].class)
          if (name === 'style' && isString(attribs[a])) attr[k].style = attrToObject(attr[k].style)
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
      const { importPkg } = this.app.bajo
      const minifier = await importPkg('waibuMpa:html-minifier-terser')
      return await minifier.minify(text, {
        collapseWhitespace: true
      })
    }

    // Based on: https://github.com/siddharth-sunchu/native-methods/blob/master/JSONStringfy.js
    jsonStringify = (obj, replacer, space) => {
      const {
        isNumber, isString, isBoolean, isUndefined, isFunction, isSymbol,
        isNull, isDate, isArray, isPlainObject
      } = this.app.lib._

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

    // based on: https://github.com/kyleparisi/pagination-layout/blob/master/pagination-layout-be.js
    paginationLayout = (totalItems, itemsPerPage, currentPage) => {
      const { isPlainObject } = this.app.lib._
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

    stripHtmlTags = (html, options = {}) => {
      const { result } = stripHtml(html, options)
      return result
    }

    urlToBreadcrumb = (url, { delimiter, returnParts, base = '', handler, handlerScope, handlerOpts } = {}) => {
      const { trim, map, last, without } = this.app.lib._
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

    getMenuPages = (menu, path, subPath) => {
      const { get, filter, isFunction } = this.app.lib._
      const all = get(menu, 'pages', [])
      if (!path) return all
      const pages = filter(all, a => {
        return a.children && (a.title === path || a.href === path)
      })
      if (!isFunction(subPath)) {
        return filter(pages, p => {
          return p.title === subPath || p.href === subPath
        })
      }
      return subPath(pages, subPath)
    }

    parseAttribs = (text, { delimiter = ' ', kvDelimiter = '=', camelCasedKey = true, trimValue = true } = {}) => {
      const { trim, camelCase, map, isPlainObject, forOwn } = this.app.lib._
      let attrs = []
      if (isPlainObject(text)) {
        forOwn(text, (v, k) => {
          attrs.push(`${k}${kvDelimiter}"${v}"`)
        })
      } else attrs = map(text.split(delimiter), t => trim(t))
      const result = {}
      const names = this.app.getAllNs()
      for (const attr of attrs) {
        let [k, ...v] = map(attr.split(kvDelimiter), a => trim(a))
        v = v.join(kvDelimiter)
        if (trimValue) v = v.slice(1, v.length - 1)
        if (v === 'undefined') continue
        if (k !== 'content' && v === '') v = true
        // check for retainAttrKey on ALL plugins
        let retain = false
        for (const name of names) {
          const plugin = this.app[name]
          if (plugin && plugin.retainAttrKey && plugin.retainAttrKey(k)) retain = true
        }
        if (!retain && camelCasedKey) k = camelCase(k)
        result[k] = v
      }
      return result
    }

    stringifyAttribs = (obj = {}, kebabCasedKey = true) => {
      const { isSet } = this.app.lib.aneka
      const { forOwn, kebabCase, isArray, isPlainObject, isEmpty } = this.app.lib._
      const { objectToAttr, arrayToAttr } = this.app.waibu
      const attrs = []
      const names = this.app.getAllNs()
      forOwn(obj, (v, k) => {
        let retain = false
        for (const name of names) {
          const plugin = this.app[name]
          if (plugin && plugin.retainAttrKey && plugin.retainAttrKey(k)) retain = true
        }
        if (retain) {
          if (v === true) attrs.push(k)
          else attrs.push(`${k}="${v}"`)
          return undefined
        }
        if (kebabCasedKey) k = kebabCase(k)
        if (!isSet(v)) return undefined
        if (['class', 'style'].includes(k) && isEmpty(v)) return undefined
        if (isArray(v)) v = arrayToAttr(v)
        if (isPlainObject(v)) v = objectToAttr(v)
        if (k !== 'content' && v === true) attrs.push(k)
        else attrs.push(`${k}="${v}"`)
      })
      return attrs.join(' ')
    }

    getTheme = (name, nameOnly) => {
      const theme = this.themes.find(item => item.name === name)
      if (!theme) return theme
      return nameOnly ? theme.name : theme
    }

    getIconset = (name, nameOnly) => {
      const iconset = this.iconsets.find(item => item.name === name)
      if (!iconset) return iconset
      return nameOnly ? iconset.name : iconset
    }
  }

  return WaibuMpa
}

export default factory
