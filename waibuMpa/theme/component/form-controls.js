const baseCls = 'pure-controls'

const formControls = {
  selector: '.' + baseCls,
  handler: async function ({ params }) {
    params.tag = 'div'
    params.attr.class.push(baseCls)
  }
}

export default formControls
