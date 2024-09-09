async function any (params = {}) {
  const { htmlTags } = this.mpa
  if (!htmlTags.includes(params.tag)) return false
}

export default any
