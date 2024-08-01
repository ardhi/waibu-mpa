const baseCls = 'container'

async function container ({ params }) {
  params.attr.class.push(baseCls)
  return '.' + baseCls
}

export default container
