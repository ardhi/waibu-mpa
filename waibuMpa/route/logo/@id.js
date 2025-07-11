import path from 'path'

async function logo (req, reply) {
  const { importPkg } = this.app.bajo
  const mime = await importPkg('waibu:mime')
  const { getPlugin } = this.app.bajo
  const { camelCase } = this.lib._
  const { fastGlob, fs } = this.lib
  const id = camelCase(req.params.id)
  const plugin = getPlugin(id)
  let type = ''
  if (req.query.type) type = `-${req.query.type}`
  const files = await fastGlob(`${plugin.dir.pkg}/logo${type}.*`)
  if (files.length === 0) throw this.error('_notFound')
  const file = files[0]
  const mimeType = mime.getType(path.extname(file))
  reply.header('Content-Type', mimeType)
  const stream = fs.createReadStream(file)
  reply.send(stream)
  return reply
}

export default logo
