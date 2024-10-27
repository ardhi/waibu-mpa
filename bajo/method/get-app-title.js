function getAppTitle (name) {
  const { getPlugin } = this.app.bajo
  const { get } = this.app.bajo.lib._
  const plugin = getPlugin(name, true)
  if (!plugin) return
  return get(plugin, 'config.waibu.title', plugin.title)
}

export default getAppTitle
