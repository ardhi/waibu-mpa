const baseClass = 'pure-controls'

const formControls = {
  selector: '.' + baseClass,
  handler: async function ({ params }) {
    params.tag = 'div'
    params.attr.class.push(baseClass)
  }
}

export default formControls
