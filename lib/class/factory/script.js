import Factory from '../factory.js'

class Script extends Factory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    this.params.noTag = true
    this.params.tag = 'script'
  }

  build = async () => {
    const { routePath } = this.plugin.app.waibu
    const { merge, isEmpty } = this.plugin.app.bajo.lib._
    const { attribsStringify, attrToObject } = this.plugin

    const result = []
    if (isEmpty(this.params.html)) {
      if (isEmpty(this.params.attr.src)) return
      this.params.attr.src = routePath(this.params.attr.src)
      return
    }
    this.params.html.trim().split('\n').forEach(i => {
      let [url, ...args] = i.trim().split(';').map(item => item.trim())
      args = attrToObject(args.join(';')) ?? {}
      if (isEmpty(args)) args = this.params.attr
      const attrs = attribsStringify(merge({}, { src: routePath(url) }, args))
      result.push(`<script ${attrs}> </script>`)
    })
    this.params.html = result.length === 0 ? '' : `\n${result.join('\n')}\n`
  }
}

export default Script
