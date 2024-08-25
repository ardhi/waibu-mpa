const baseClass = 'pure-form'

const form = {
  selector: '.' + baseClass,
  handler: async function ({ params, reply } = {}) {
    params.tag = 'form'
    const attr = params.attr
    attr.class.push(baseClass)
    switch (attr.mode) {
      case 'inline': break
      case 'horizontal': attr.class.push('pure-form-aligned'); break
      default: attr.class.push('pure-form-stacked')
    }
    delete attr.mode
  }
}

export default form
