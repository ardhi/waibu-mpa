const subNses = ['layout', 'template']

function getResource (name) {
  const { ns, path, subNs, subSubNs, qs } = this.app.bajo.breakNsPath(name)
  const plugin = this.app.bajo.getPlugin(ns)
  const dir = `${plugin.dir.pkg}/waibuMpa`
  if (!subNses.includes(subNs)) throw this.error('Unknown resource \'%s\'', name)
  const fullPath = subSubNs ? `${dir}/${subSubNs}/${subNs}${path}` : `${dir}/${subNs}${path}`
  return { ns, subNs, subSubNs, path, qs, fullPath }
}

export default getResource
