async function img ({ params, reply } = {}) {
  const { has } = this._
  params.tag = 'img'
  if (has(params.attr, 'responsive')) {
    params.attr.class.push('pure-img')
    delete params.attr.responsive
  }
}

export default img
