async function datalist ({ params, reply }) {
  const { has } = this._
  if (has(params.attr, 'options')) params.html = this._buildOptions({ params })
  params.tag = 'datalist'
}

export default datalist
