import crypto from 'crypto'

async function getCachedResult (content, params, { req, ttl = 0, fn = false, keyFn, tpl } = {}) {
  const _ = this.app.bajo.lib._
  const { template, get } = _
  const cache = this.app.bajoCache
  const opts = {
    imports: {
      _,
      _t: get(req, 't'),
      _format: (val, type, opts = {}) => {
        opts.lang = opts.lang ?? req.lang
        return this.app.bajo.format(val, type, opts)
      },
      _routePath: this.app.waibu.routePath,
      _titleize: this.app.bajo.titleize,
      _jsonStringify: this.app.waibuMpa.jsonStringify,
      _hasPlugin: name => this.app.bajo.pluginNames.includes(name)
    }
  }

  let item
  if (cache) {
    let key = keyFn ? await keyFn.call(this, { content, params }) : crypto.createHash('md5').update(content).digest('hex')
    if (fn) key = 'fn:' + key
    const value = fn ? template(content, opts) : content
    item = await cache.sync({ key, value, ttl })
  } else {
    item = fn ? template(content, opts) : content
  }
  return fn ? item(params) : item
}

export default getCachedResult
