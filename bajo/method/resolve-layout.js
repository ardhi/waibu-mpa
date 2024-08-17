const cache = {}

function resolveTemplate (item = 'waibuMpa:/default.html') {
  const env = this.app.bajo.config.env
  if (env !== 'dev' && cache[item]) return cache[item]
  const { getPluginDataDir, breakNsPath } = this.app.bajo
  const { fs } = this.app.bajo.lib
  const { trim } = this.app.bajo.lib._

  let { ns, path, qs } = breakNsPath(item)

  path = trim(path, '/')
  let file
  // check override: theme specific
  let check = `${getPluginDataDir(ns)}/${this.name}/layout/_${qs.theme}/${path}`
  if (fs.existsSync(check)) file = check
  // check override: common
  if (!file) {
    check = `${getPluginDataDir(ns)}/${this.name}/layout/${path}`
    if (fs.existsSync(check)) file = check
  }
  // check real: theme specific
  if (!file) {
    check = `${this.app[ns].dir.pkg}/${this.name}/layout/_${qs.theme}/${path}`
    if (fs.existsSync(check)) file = check
  }
  // check real: common
  if (!file) {
    check = `${this.app[ns].dir.pkg}/${this.name}/layout/${path}`
    if (fs.existsSync(check)) file = check
  }
  // fallback
  if (!file) {
    check = `${this.dir.pkg}/${this.name}/layout/default.html`
    if (fs.existsSync(check)) file = check
  }
  if (!file) throw this.error('Can\'t find layout: %s (%s:%s)', check, ns, path)
  const result = { file, theme: qs.theme, ns }
  if (env !== 'dev') cache[item] = result
  return result
}

export default resolveTemplate
