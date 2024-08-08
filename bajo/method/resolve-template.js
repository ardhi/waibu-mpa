import _path from 'path'

const cache = {}

function resolveTemplate (item = '') {
  if (cache[item]) return cache[item]
  const { getPluginDataDir } = this.app.bajo
  const { fs } = this.app.bajo.lib
  const { find, trim } = this.app.bajo.lib._

  let [ns, path, themeName] = item.split(':')
  const ext = _path.extname(path)
  this.getViewEngine(ext)

  path = trim(path, '/')
  const theme = find(this.themes, { name: themeName })
  if (!theme) throw this.error('Unknown theme \'%s\'. Make sure it\'s already loaded')
  let file
  // check override: theme specific
  let check = `${getPluginDataDir(ns)}/${this.name}/template/_${theme.name}/${path}`
  if (fs.existsSync(check)) file = check
  // check override: common
  if (!file) {
    check = `${getPluginDataDir(ns)}/${this.name}/template/${path}`
    if (fs.existsSync(check)) file = check
  }
  // check real: theme specific
  if (!file) {
    check = `${this.app[ns].config.dir.pkg}/${this.name}/template/_${theme.name}/${path}`
    if (fs.existsSync(check)) file = check
  }
  // check real: common
  if (!file) {
    check = `${this.app[ns].config.dir.pkg}/${this.name}/template/${path}`
    if (fs.existsSync(check)) file = check
  }
  if (!file) throw this.error('Can\'t find template: %s (%s:%s)', check, ns, path)
  const result = { file, theme, ns }
  cache[item] = result
  return result
}

export default resolveTemplate
