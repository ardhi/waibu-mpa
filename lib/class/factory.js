import path from 'path'

class Factory {
  static scripts = []
  static css = []
  static inlineScript = null
  static inlineCss = null

  constructor (options = {}) {
    this.component = options.component
    this.plugin = this.component.plugin
    this.params = options.params ?? {}
    this.blockTypes = ['init', 'initializing', 'run', 'reactive',
      'nonReactive', 'dataInit', 'keyup'
    ]
    this.block = {}
    this.init()
  }

  init = () => {
    for (const block of this.blockTypes) {
      this.block[block] = this.block[block] ?? []
    }
  }

  build = async () => {
  }

  readBlock = (blocks = []) => {
    const { isString, trim } = this.plugin.app.bajo.lib._
    const { $ } = this.component
    const me = this
    if (isString(blocks)) blocks = [blocks]
    $(`<div>${this.params.html}</div>`).find('script').each(function () {
      const type = this.attribs.block ?? 'run'
      if (blocks.length > 0 && !blocks.includes(type)) return undefined
      if (me.blockTypes.includes(type)) {
        const html = trim($(this).prop('innerHTML'))
        if (!me.block[type].includes(html)) me.block[type].push(html)
      }
    })
  }

  writeBlock = () => {
    const { isString, omit } = this.plugin.app.bajo.lib._
    const { attribsStringify } = this.plugin.app.waibuMpa
    const html = []
    for (const key in this.block) {
      const items = this.block[key]
      if (items.length === 0) continue
      for (let item of items) {
        if (isString(item)) item = { content: item }
        item.block = key
        const attrs = attribsStringify(omit(item, ['content']))
        html.push(`<script ${attrs}>${item.content}</script>`)
      }
    }
    return html.join('\n')
  }

  loadTemplate = (name, { escape = false } = {}) => {
    const [, type] = name.split(':')[0].split('.')
    const mpa = this.plugin.app.waibuMpa
    const { camelCase } = this.plugin.app.bajo.lib._
    const { fs } = this.plugin.app.bajo.lib
    const opts = {
      partial: true,
      ext: path.extname(name) ?? '.html',
      req: this.component.req,
      reply: this.component.reply
    }
    const resp = mpa[camelCase(`resolve ${type}`)](name, opts)
    const content = fs.readFileSync(resp.file, 'utf8')
    if (!escape) return content
    return content.replaceAll("'", "\\'")
  }
}

export default Factory
