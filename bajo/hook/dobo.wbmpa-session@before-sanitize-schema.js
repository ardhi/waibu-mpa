async function doboWbmpaSessionBeforeSanitizeSession (schema) {
  const { find } = this.app.bajo.lib._

  const dobo = this.app.dobo
  let conn = find(dobo.connections, { name: schema.connection })
  if (!conn) conn = find(dobo.connections, { name: 'memory' })
  if (conn) schema.connection = conn.name
}

export default doboWbmpaSessionBeforeSanitizeSession
