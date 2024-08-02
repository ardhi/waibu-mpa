const baseCls = 'pure-g'

const gridRow = {
  selector: '.' + baseCls,
  handler: async function ({ params, reply } = {}) {
    params.attr.class.push(baseCls)
  }
}

export default gridRow
