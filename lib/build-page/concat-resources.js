import path from 'path'
import { printLink } from './inject-elements/css.js'
import { printScript } from './inject-elements/script.js'

async function apply ({ $, req, tag, attr, type }) {
  const { includes } = this.app.bajo
  const { routePath } = this.app.waibu
  const { hash, fetch } = this.app.bajoExtra
  const { isEmpty, map, without } = this.app.bajo.lib._
  const cache = this.app.bajoCache
  const excluded = map(this.config.concatResource.excluded, item => routePath(item))
  let cachePrefix = this.app.bajoCache.config.externalPrefix
  if (!cachePrefix) return
  cachePrefix += ':'

  const baseUrl = `${req.protocol}://${req.hostname}${req.port ? `:${req.port}` : ''}` // TODO: auth, if any
  const items = []
  $(`${tag}[${attr}]`).each(function () {
    items.push(this.attribs[attr])
  })
  if (items.length === 0) return
  const key = cachePrefix + await hash(items)
  const cached = await cache.get({ key })
  let keys = []
  const notKeys = []
  if (!cached) {
    const contents = []
    for (const item of items) {
      try {
        if (excluded.includes(item)) throw this.error('excludedFromRscConcat%s', item)
        let url = item
        if (!item.startsWith('http')) {
          const u = new URL(req.url, baseUrl)
          if (item[0] === '/') url = u.origin + url
          else url = u.origin + path.dirname(u.pathname) + '/' + url
        }
        const resp = await fetch(url, undefined, { rawResponse: true })
        if (!resp.ok) throw this.error('respError%s', resp.status)
        const text = await resp.text()
        if (type === 'css' && includes(['url(".', 'url(.', 'url(\'.'], text)) throw this.error('cssContainsRelPath%s', item)
        contents.push(`/* waibu resource: ${item} */`, text)
        keys.push(item)
      } catch (err) {
        notKeys.push(item)
      }
    }
    if (isEmpty(contents)) return
    $(map(keys, k => `${tag}[${attr}="${k}"]`).join(',')).remove()
    // await cache.set({ key, value: contents.join('\n'), ttl: this.config.page.cacheMaxAge * 1000 })
    const value = { contents, notKeys, type, tag, attr }
    await cache.set({ key, value, ttl: this.config.concatResource.cacheMaxAge * 1000 })
  } else {
    keys = without(items, ...cached.notKeys)
    $(map(keys, k => `${tag}[${attr}="${k}"]`).join(',')).remove()
  }
  const rsc = `bajoCache:/external/${key.replace(cachePrefix, '')}.${type}`
  if (tag === 'link') $('head').prepend(printLink.call(this, rsc))
  else if (tag === 'script') $('body').append(printScript.call(this, rsc))
}

async function concatResources (options) {
  const { $, req } = options ?? {}
  if (!(this.app.bajoExtra && this.app.bajoCache)) return
  if (this.config.concatResource.cacheMaxAge < 1) return
  if (this.config.concatResource.css) await apply.call(this, { $, req, tag: 'link', attr: 'href', type: 'css' })
  if (this.config.concatResource.scripts) await apply.call(this, { $, req, tag: 'script', attr: 'src', type: 'js' })
}

export default concatResources
