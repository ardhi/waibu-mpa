import resolveResource, { filecheck } from '../../lib/resolve-resource.js'

function fallbackHandler ({ file, exts, ns, subSubNs, type, theme }) {
  const dir = ''
  const base = 'default'
  if (!this.config.viewEngine.layout.fallback) return false
  // check main: theme specific
  if (theme && !file) {
    const check = `${this.app.main.dir.pkg}/${this.name}/${type}/_${theme.name}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  // check mail: common
  if (!file) {
    const check = `${this.app.main.dir.pkg}/${this.name}/${type}`
    file = filecheck.call(this, { dir, base, exts, check })
  }
  // check fallback: common
  if (!file) file = filecheck.call(this, { dir, base, exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}${type}` })
  // check general fallback
  if (!file) file = filecheck.call(this, { dir, base, exts, check: `${this.dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}${type}` })
  return file
}

function resolveLayout (item = '', opts = {}) {
  return resolveResource.call(this, 'layout', item, opts, fallbackHandler)
}

export default resolveLayout
