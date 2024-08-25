const baseClass = 'pure-g'

const gridRow = {
  selector: '.' + baseClass,
  handler: async function ({ params, reply } = {}) {
    params.attr.class.push(baseClass)
  }
}

export default gridRow
