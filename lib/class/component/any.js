async function any (params = {}) {
  const { htmlTags } = this.plugin.app.waibuMpa
  if (!htmlTags.includes(params.tag)) return false
}

export default any
