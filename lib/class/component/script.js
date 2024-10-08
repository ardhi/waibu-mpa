async function script (params = {}) {
  const { routePath } = this.plugin.app.waibu
  const { merge, isEmpty } = this.plugin.app.bajo.lib._
  const { attribsStringify, attrToObject } = this.plugin

  const result = []
  params.tag = 'script'
  if (isEmpty(params.html)) {
    if (isEmpty(params.attr.src)) return
    params.attr.src = routePath(params.attr.src)
    return
  }
  params.noTag = true
  params.html.trim().split('\n').forEach(i => {
    let [url, ...args] = i.trim().split(';').map(item => item.trim())
    args = attrToObject(args.join(';')) ?? {}
    if (isEmpty(args)) args = params.attr
    const attrs = attribsStringify(merge({}, { src: routePath(url) }, args))
    result.push(`<script ${attrs}> </script>`)
  })
  params.html = result.length === 0 ? '' : `\n${result.join('\n')}\n`
}

export default script
