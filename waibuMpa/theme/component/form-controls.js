const baseCls = 'pure-controls'

async function formControls ({ params }) {
  params.tag = 'div'
  params.attr.class.push(baseCls)
  return baseCls
}

export default formControls
