import { filecheck } from './resolve-template.js'
import _path from 'path'
const cache = {}

function resolveLayout (item = '', opts = {}) {
  const env = this.app.bajo.config.env
  if (env !== 'dev' && cache[item]) return cache[item]
  const { getPluginDataDir } = this.app.bajo
  const { trim, find } = this.app.bajo.lib._

  const theme = find(this.themes, { name: opts.theme })
  let { ns, subSubNs, path } = this.getResource(item)
  const ext = _path.extname(path)
  this.getViewEngine(ext)
  path = trim(path, '/')
  const dir = _path.dirname(path)
  const base = _path.basename(path, ext)
  const exts = [`.${opts.req.lang}${ext}`, ext]

  let file
  // check override: theme specific
  if (theme) file = filecheck.call(this, { dir, base, exts, check: `${getPluginDataDir(ns)}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}layout/_${theme.name}` })
  // check override: common
  if (!file) file = filecheck.call(this, { dir, base, exts, check: `${getPluginDataDir(ns)}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}layout` })
  // check real: theme specific
  if (theme && !file) file = filecheck.call(this, { dir, base, exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}layout/_${theme.name}` })
  // check real: common
  if (!file) file = filecheck.call(this, { dir, base, exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}layout` })
  // check fallback: common
  if (!file && this.config.viewEngine.layout.fallback) file = filecheck.call(this, { dir: '', base: 'default', exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}layout` })
  // check general fallback
  if (!file && this.config.viewEngine.layout.fallback) file = filecheck.call(this, { dir: '', base: 'default', exts, check: `${this.dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}layout` })
  if (!file) throw this.error('Can\'t find layout: %s', item)
  const result = { file, theme: opts.theme, ns }
  if (env !== 'dev') cache[item] = result
  return result
}

export default resolveLayout
