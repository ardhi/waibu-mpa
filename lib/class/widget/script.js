async function scriptFactory () {
  class Script extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      this.component.normalizeAttr(this.params)
      this.params.noTag = true
      this.params.tag = 'script'
    }

    build = async () => {
      const { routePath } = this.app.waibu
      const { merge, isEmpty } = this.app.lib._
      const { stringifyAttribs } = this.plugin
      const { attrToObject } = this.app.waibu

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
        const attrs = stringifyAttribs(merge({}, { src: routePath(url) }, args))
        result.push(`<script ${attrs}> </script>`)
      })
      this.params.html = result.length === 0 ? '' : `\n${result.join('\n')}\n`
    }
  }

  return Script
}

export default scriptFactory
