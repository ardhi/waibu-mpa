import _path from 'path'
const cache = {}

export function filecheck ({ check, dir, base, exts }) {
  const { fs } = this.app.bajo.lib
  let file
  for (const ext of exts) {
    let path = `${check}/${dir}/${base}${ext}`
    if (['', '.'].includes(dir)) path = `${check}/${base}${ext}`
    if (fs.existsSync(path)) {
      file = path
      break
    }
  }
  return file
}

function resolveResource (type, item = '', opts = {}, fallbackHandler) {
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

  const extension = subSubNs ? `extend/${subSubNs}/` : ''
  let file
  // check override: theme specific
  if (theme) {
    const check = `${getPluginDataDir(ns)}/${this.name}/${extension}${type}/_${theme.name}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  // check override: common
  if (!file) {
    const check = `${getPluginDataDir(ns)}/${this.name}/${extension}${type}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  // check main override: theme specific
  if (theme && !file) {
    const check = `${this.app.main.dir.pkg}/${this.name}/extend/${ns}/${type}/_${theme.name}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  // check main override: common
  if (!file) {
    const check = `${this.app.main.dir.pkg}/${this.name}/extend/${ns}/${type}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  // check real: theme specific
  if (theme && !file) {
    const check = `${this.app[ns].dir.pkg}/${this.name}/${extension}${type}/_${theme.name}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  // check real: common
  if (!file) {
    const check = `${this.app[ns].dir.pkg}/${this.name}/${extension}${type}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  if (fallbackHandler) file = fallbackHandler.call(this, { file, dir, base, exts, ns, subSubNs, type, theme })
  if (!file) throw this.error('cantFind%s%s', type, item)
  const result = { file, theme, ns, layout: opts.layout }
  if (env !== 'dev') cache[item] = result
  return result
}

export default resolveResource
