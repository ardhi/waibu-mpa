function getViewEngine (ext) {
  const { find } = this.app.bajo.lib._
  const ve = find(this.viewEngines, v => v.fileExts.includes(ext))
  return ve ?? find(this.viewEngines, v => v.name === 'default')
}

export default getViewEngine
