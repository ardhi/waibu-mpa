async function datalist (params = {}) {
  if (params.attr.options) params.html = this._buildOptions(params)
  params.tag = 'datalist'
}

export default datalist
