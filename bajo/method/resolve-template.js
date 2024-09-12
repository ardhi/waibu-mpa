import path from 'path'
const cache = {}

function resolveTemplate (item = '') {
  const env = this.app.bajo.config.env
  if (env !== 'dev' && cache[item]) return cache[item]
  const { getPluginDataDir, breakNsPath } = this.app.bajo
  const { fs } = this.app.bajo.lib
  const { find, trim } = this.app.bajo.lib._

  let { ns, path: fullPath, qs } = breakNsPath(item)
  const ext = path.extname(fullPath)
  this.getViewEngine(ext)

  fullPath = trim(fullPath, '/')
  const theme = find(this.themes, { name: qs.theme })
  let file
  let check
  // check override: theme specific
  if (theme) {
    check = `${getPluginDataDir(ns)}/${this.name}/template/_${theme.name}/${fullPath}`
    if (fs.existsSync(check)) file = check
  }
  // check override: common
  if (!file) {
    check = `${getPluginDataDir(ns)}/${this.name}/template/${fullPath}`
    if (fs.existsSync(check)) file = check
  }
  // check real: theme specific
  if (theme && !file) {
    check = `${this.app[ns].dir.pkg}/${this.name}/template/_${theme.name}/${fullPath}`
    if (fs.existsSync(check)) file = check
  }
  // check real: common
  if (!file) {
    check = `${this.app[ns].dir.pkg}/${this.name}/template/${fullPath}`
    if (fs.existsSync(check)) file = check
  }
  if (!file) throw this.error('Can\'t find template: %s (%s:%s)', check, ns, fullPath)
  const result = { file, theme, ns, layout: qs.layout }
  if (env !== 'dev') cache[item] = result
  return result
}

export default resolveTemplate
