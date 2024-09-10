const img = {
  selector: 'img',
  handler: async function img ({ params, reply } = {}) {
    const { has, omit } = this.plugin.app.bajo.lib._
    params.tag = 'img'
    const attr = params.attr
    if (has(attr, 'responsive')) {
      attr.class.push('pure-img')
    }
    params.attr = omit(attr, ['responsive'])
  }
}

export default img
