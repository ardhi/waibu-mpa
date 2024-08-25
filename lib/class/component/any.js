async function any ({ params, reply }) {
  const { htmlTags } = this.mpa
  if (!htmlTags.includes(params.tag)) return false
}

export default any
