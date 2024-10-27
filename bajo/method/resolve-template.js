import _path from 'path'
const cache = {}

export function filecheck ({ check, dir, base, exts }) {
  const { fs } = this.app.bajo.lib
  let file
  for (const ext of exts) {
    const path = dir === '' ? `${check}/${base}${ext}` : `${check}/${dir}/${base}${ext}`
    if (fs.existsSync(path)) {
      file = path
      break
    }
  }
  return file
}

function resolveTemplate (item = '', opts = {}) {
  const { getPluginDataDir } = this.app.bajo
  const { trim } = this.app.bajo.lib._
  const env = this.app.bajo.config.env
  if (env !== 'dev' && cache[item]) return cache[item]
  const { find } = this.app.bajo.lib._

  const theme = find(this.themes, { name: opts.theme })
  let { ns, subSubNs, path } = this.getResource(item)
  const ext = _path.extname(path)
  this.getViewEngine(ext)
  path = trim(path, '/')
  const dir = _path.dirname(path)
  const base = _path.basename(path, ext)
  const exts = [`.${opts.req.lang}${ext}`, ext]

  // check override: theme specific
  let file
  if (theme) file = filecheck.call(this, { dir, base, exts, check: `${getPluginDataDir(ns)}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}template/_${theme.name}` })
  // check override: common
  if (!file) file = filecheck.call(this, { dir, base, exts, check: `${getPluginDataDir(ns)}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}template` })
  // check real: theme specific
  if (theme && !file) file = filecheck.call(this, { dir, base, exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}template/_${theme.name}` })
  // check real: common
  if (!file) file = filecheck.call(this, { dir, base, exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}template` })
  if (!file) throw this.error('Can\'t find template: %s', item)
  const result = { file, theme, ns, layout: opts.layout }
  if (env !== 'dev') cache[item] = result
  return result
}

export default resolveTemplate
