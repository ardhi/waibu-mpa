function defHandler (item) {
  return item
}

function breakPath (route, delimiter = '/') {
  const { trim, last, without } = this.app.bajo.lib._

  route = trim(route, delimiter)
  const parts = without(route.split(delimiter), '')
  const routes = []
  for (const p of parts) {
    const l = last(routes)
    routes.push(l ? `${l}${delimiter}${p}` : p)
  }
  return routes
}

function urlToBreadcrumb (url, { delimiter, returnParts, base = '', handler, handlerScope } = {}) {
  const { trim, map } = this.app.bajo.lib._
  const { routePath } = this.app.waibu
  url = routePath(url)
  const route = trim(url.replace(base, ''), '/')
  const parts = breakPath.call(this, route, delimiter)
  if (returnParts) return parts
  if (!handler) handler = defHandler
  if (!handlerScope) handlerScope = this
  const result = map(parts, r => {
    const f = `${base}/${r}`
    return handler.call(handlerScope, f, url)
  })
  return result
}

export default urlToBreadcrumb
