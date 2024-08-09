import crypto from 'crypto'

async function getCachedResult (content, params, { reply, ttl = 0, fn = false, keyFn } = {}) {
  const _ = this.app.bajo.lib._
  const { template, get } = _
  const cache = this.app.bajoCache
  const opts = {
    imports: {
      _,
      _t: get(reply, 'request.i18n.t'),
      _te: get(reply, 'request.i18n.exists')
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
