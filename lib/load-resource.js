async function loadResource (mod = [], item) {
  const { breakNsPath, readConfig } = this.app.bajo
  const { isArray, isEmpty } = this.app.bajo.lib._
  const { routePath } = this.app.waibu

  if (isEmpty(mod[item])) return []
  if (!isArray(mod[item])) mod[item] = [mod[item]]
  const items = []
  const extItems = []
  for (const i in mod[item]) {
    if (mod[item][i].startsWith('/')) items.push(mod.css[i])
    else {
      const { ns, path, subNs } = breakNsPath(mod[item][i])
      if (subNs === 'load') extItems.push({ ns, path })
      else items.push(routePath(mod[item][i]))
    }
  }
  for (const c of extItems) {
    let emod = await readConfig(`${c.ns}:${c.path}`, { ns: c.ns })
    if (!isArray(emod)) emod = [emod]
    for (const m of emod) {
      items.push(m.startsWith('/') ? m : routePath(m))
    }
  }
  return items
}

export default loadResource
