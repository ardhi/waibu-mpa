import path from 'path'

class BaseFactory {
  static scripts = []
  static css = []
  static inlineScript = null
  static inlineCss = null

  constructor (options = {}) {
    this.component = options.component
    this.plugin = this.component.plugin
    this.params = options.params ?? {}
    this.block = {}
    this.setting = this._parseBase64Attr(this.params.attr.setting)
  }

  _parseBase64Attr = (text, defValue = {}) => {
    const { base64JsonDecode } = this.plugin.app.waibuMpa
    let result = defValue
    try {
      result = base64JsonDecode(text)
    } catch (err) {}
    return result
  }

  build = async () => {
  }

  addBlock = (type, blocks) => {
    const { isArray } = this.plugin.lib._
    if (!blocks) {
      blocks = type
      type = 'run'
    }
    this.block[type] = this.block[type] ?? []
    if (!isArray(blocks)) blocks = [blocks]
    for (const b of blocks) {
      if (!this.block[type].includes(b)) this.block[type].push(b)
    }
  }

  readBlock = (blocks = []) => {
    const { isString, trim } = this.plugin.lib._
    const { $ } = this.component
    const me = this
    if (isString(blocks)) blocks = [blocks]
    $(`<div>${this.params.html}</div>`).find('script').each(function () {
      const type = this.attribs.block ?? 'run'
      if (blocks.length > 0 && !blocks.includes(type)) return undefined
      const html = trim($(this).prop('innerHTML'))
      me.addBlock(type, html)
    })
  }

  writeBlock = () => {
    const { isString, omit } = this.plugin.lib._
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
    const { camelCase } = this.plugin.lib._
    const { fs } = this.plugin.lib
    const opts = {
      partial: true,
      ext: path.extname(name) ?? '.html',
      req: this.component.req,
      reply: this.component.reply
    }
    const resp = this.plugin.app.bajoTemplate[camelCase(`resolve ${type}`)](name, opts)
    const content = fs.readFileSync(resp.file, 'utf8')
    if (!escape) return content
    return content.replaceAll("'", "\\'")
  }
}

export default BaseFactory
