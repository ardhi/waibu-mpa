const baseCls = 'pure-table'

async function table ({ params }) {
  const { has, omit } = this._
  params.tag = 'table'
  const attr = params.attr
  attr.class.push(baseCls)
  if (has(attr, 'bordered')) attr.class.push('pure-table-bordered')
  else if (has(attr, 'h-bordered')) attr.class.push('pure-table-horizontal')
  else if (has(attr, 'v-bordered')) attr.class.push('pure-table-vertical')
  if (has(attr, 'striped')) attr.class.push('pure-table-striped')
  params.attr = omit(attr, ['bordered', 'h-bordered', 'v-bordered'])
  return '.' + baseCls
}

export default table
