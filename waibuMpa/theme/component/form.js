const baseCls = 'pure-form'

async function form ({ params, reply } = {}) {
  params.tag = 'form'
  const attr = params.attr
  attr.class.push(baseCls)
  switch (attr.mode) {
    case 'inline': break
    case 'horizontal': attr.class.push('pure-form-aligned'); break
    default: attr.class.push('pure-form-stacked')
  }
  delete attr.mode
  return '.' + baseCls
}

export default form
