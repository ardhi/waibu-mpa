import path from 'path'

async function isCacheable (req, cachedUrls) {
  const { hash } = this.app.bajoExtra
  const { get, omit, isFunction } = this.app.lib._
  const ns = get(req, 'routeOptions.config.ns')
  let cache = get(req, 'routeOptions.config.cache', omit(this.config.page.cache, ['urls']))
  cache.methods = cache.methods ?? ['GET']
  if (!ns || (!this.app.bajoCache) || (!req.site) || !cache.methods.includes(req.method)) return { ttl: 0 }
  if (isFunction(cache)) {
    cache = await cache.call(this.app[ns], req, cachedUrls)
  }
  const url = req.url.split('?')[0].split('#')[0]
  for (const item of cachedUrls) {
    if (item.isMatch(url)) cache.ttlDur = item.ttlDur ?? cache.ttlDur
  }
  const key = `waibu-mpa-page-${req.site.id}-${cache.key ?? (await hash(req.url))}`
  return { key, ttl: cache.ttlDur }
}

async function decorate () {
  const { importPkg } = this.app.bajo
  const { isString, cloneDeep, isEmpty } = this.app.lib._
  const { get: getCache, set: setCache } = this.app.bajoCache ?? {}
  const { outmatch } = this.app.lib
  const { routePath } = this.app.waibu
  const mime = await importPkg('waibu:mime')
  const cfg = this.config
  const me = this
  const cachedUrls = cloneDeep(this.config.page.cache.urls).map(item => {
    if (isString(item)) item = { url: item }
    item.url = routePath(item.url)
    item.isMatch = outmatch(item.url)
    return item
  })
  this.webAppCtx.decorateRequest('theme', cfg.theme.set)
  this.webAppCtx.decorateRequest('iconset', cfg.iconset.set)
  this.webAppCtx.decorateRequest('darkMode', cfg.darkMode.set)
  this.webAppCtx.decorateRequest('referer', '')
  this.webAppCtx.decorateReply('ctags', null)
  this.webAppCtx.decorateReply('view', async function (tpl, params = {}, opts = {}) {
    // this = fastify context!
    let ext = path.extname(tpl)
    if (ext === '.md') ext = '.html'
    let mimeType = isEmpty(ext) ? 'text/html' : mime.getType(ext)
    mimeType += `; charset=${cfg.page.charset}`
    this.header('Content-Type', mimeType)
    this.header('Content-Language', this.request.lang)
    opts.req = this.request
    opts.reply = this
    for (const item of ['theme', 'iconset']) {
      if (!this.request[item]) this.request[item] = me[item + 's'][0].name
      if (me[item + 's'].length === 1) this.request[item] = me[item + 's'][0].name
    }
    const { key, ttl } = await isCacheable.call(me, this.request, cachedUrls)
    if (ttl > 0) {
      const cached = await getCache({ key })
      if (cached) {
        this.header('X-Wmpa-Cached', true)
        return cached
      }
    }
    const result = await me.render(tpl, params, opts)
    if (ttl > 0) await setCache({ key, value: result, ttl })
    if (this.request.session) {
      ext = path.extname(this.request.url)
      if (isEmpty(ext) || ['.html'].includes(ext)) {
        if (this.request.session.prevUrl !== this.request.url) this.request.session.prevUrl = this.request.url
        else this.request.session.prevUrl = ''
      }
    }
    return result
  })
}

export default decorate
