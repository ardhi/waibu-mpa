import _path from 'path'

const cache = {}

function getTplAndTheme (item = '') {
  if (cache[item]) return cache[item]
  const { getPluginDataDir } = this.app.bajo
  const { fs } = this.app.bajo.lib
  const { each, find, isEmpty, trim } = this.app.bajo.lib._

  let [ns, path, theme] = item.split(':')
  const ext = _path.extname(path)
  const ve = this.getViewEngine(ext)
  if (isEmpty(theme)) theme = undefined

  path = trim(path, '/')
  const themeDef = find(this.themes, { name: theme }) ?? {}
  const framework = themeDef.framework ?? 'default'
  const types = [`${theme}@${framework}`, framework, 'default']
  let file
  let check
  // check override
  each(types, type => {
    check = `${getPluginDataDir(ns)}/${ve.plugin.name}/view-engine/template/${type}/${path}`
    if (fs.existsSync(check)) {
      file = check
      return false
    }
  })
  // check real template
  if (!file) {
    if (this.config.traceNoTemplate) this.log.trace('Can\'t find template override: %s (%s)', check, item)
    each(types, type => {
      check = `${this.app[ns].config.dir.pkg}/${ve.plugin.name}/view-engine/template/${type}/${path}`
      if (fs.existsSync(check)) {
        file = check
        return false
      }
    })
  }
  if (file) cache[item] = { file, theme, ns }
  else file = check
  return { file, theme, ns }
}

export default getTplAndTheme
