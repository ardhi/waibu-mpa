const baseCls = 'container'

const container = {
  selector: '.' + baseCls,
  handler: async function ({ params }) {
    params.attr.class.push(baseCls)
  }
}

export default container
