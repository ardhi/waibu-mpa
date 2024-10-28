import resolveResource, { filecheck } from '../../lib/resolve-resource.js'

function fallbackHandler ({ file, dir, base, exts, ns, subSubNs, type }) {
  // check fallback: common
  if (!file && this.config.viewEngine.layout.fallback) file = filecheck.call(this, { dir: '', base: 'default', exts, check: `${this.app[ns].dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}${type}` })
  // check general fallback
  if (!file && this.config.viewEngine.layout.fallback) file = filecheck.call(this, { dir: '', base: 'default', exts, check: `${this.dir.pkg}/${this.name}/${subSubNs ? (subSubNs + '/') : ''}${type}` })
  return file
}

function resolveLayout (item = '', opts = {}) {
  return resolveResource.call(this, 'layout', item, opts, fallbackHandler)
}

export default resolveLayout
