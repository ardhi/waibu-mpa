import _path from 'path'
const cache = {}

function resolveTemplate (item = '', opts = {}) {
  const env = this.app.bajo.config.env
  if (env !== 'dev' && cache[item]) return cache[item]
  const { getPluginDataDir } = this.app.bajo
  const { fs } = this.app.bajo.lib
  const { find, trim } = this.app.bajo.lib._

  let { ns, path, qs } = this.getResource(item)
  const ext = _path.extname(path)
  this.getViewEngine(ext)

  path = trim(path, '/')
  const theme = find(this.themes, { name: qs.theme ?? opts.theme })
  let file
  let check
  // check override: theme specific
  if (theme) {
    check = `${getPluginDataDir(ns)}/${this.name}/template/_${theme.name}/${path}`
    if (fs.existsSync(check)) file = check
  }
  // check override: common
  if (!file) {
    check = `${getPluginDataDir(ns)}/${this.name}/template/${path}`
    if (fs.existsSync(check)) file = check
  }
  // check real: theme specific
  if (theme && !file) {
    check = `${this.app[ns].dir.pkg}/${this.name}/template/_${theme.name}/${path}`
    if (fs.existsSync(check)) file = check
  }
  // check real: common
  if (!file) {
    check = `${this.app[ns].dir.pkg}/${this.name}/template/${path}`
    if (fs.existsSync(check)) file = check
  }
  if (!file) throw this.error('Can\'t find template: %s (%s)', check, item)
  const result = { file, theme, ns, layout: qs.layout }
  if (env !== 'dev') cache[item] = result
  return result
}

export default resolveTemplate
