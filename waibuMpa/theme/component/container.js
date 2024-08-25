const baseClass = 'container'

const container = {
  selector: '.' + baseClass,
  handler: async function ({ params }) {
    params.attr.class.push(baseClass)
  }
}

export default container
