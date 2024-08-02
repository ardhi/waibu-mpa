const tag = 'legend'

const formLegend = {
  selector: tag,
  handler: async function ({ params }) {
    params.tag = tag
  }
}

export default formLegend
