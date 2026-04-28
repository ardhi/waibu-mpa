import path from 'path'

async function widgetFactory () {
  const { kebabCase, get } = this.app.lib._

  class MpaWidget extends this.app.baseClass.MpaTools {
    static scripts = []
    static css = []
    static links = []
    static inlineScript = null
    static inlineCss = null

    constructor ({ component = {}, params = {} } = {}) {
      super(component.plugin)
      const names = kebabCase(this.constructor.name).split('-')
      const alias = names.length > 1 ? names[0] : 'wbs'
      let plugin = this.app.bajo.getPlugin(alias, true)
      if (!plugin) plugin = this.app.waibuBootstrap
      this.plugin = plugin
      this.app = plugin.app
      this.component = component
      this.params = params
      this.block = {}
      this.setting = this._parseBase64Attr(this.params.attr.setting)
      this.formData = get(this, `component.locals.${this.params.attr.keyLocals ?? 'form'}`, {})
      this.oldData = get(this, `component.locals.${this.params.attr.keyOldData ?? 'oldData'}`, {})
      this.schema = get(this, `component.locals.${this.params.attr.keySchema ?? 'schema'}`, {})
    }

    _parseBase64Attr = (text, defValue = {}) => {
      const { base64JsonDecode } = this.app.waibu
      let result = defValue
      try {
        result = base64JsonDecode(text)
      } catch (err) {}
      return result
    }

    build = async () => {
    }

    addBlock = (type, blocks) => {
      const { isArray } = this.app.lib._
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
      const { isString, trim } = this.app.lib._
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
      const { isString, omit } = this.app.lib._
      const { stringifyAttribs } = this.app.waibuMpa
      const html = []
      for (const key in this.block) {
        const items = this.block[key]
        if (items.length === 0) continue
        for (let item of items) {
          if (isString(item)) item = { content: item }
          item.block = key
          const attrs = stringifyAttribs(omit(item, ['content']))
          html.push(`<script ${attrs}>${item.content}</script>`)
        }
      }
      return html.join('\n')
    }

    loadTemplate = (name, { escape = false } = {}) => {
      const [, type] = name.split(':')[0].split('.')
      const { camelCase } = this.app.lib._
      const { fs } = this.app.lib
      const opts = {
        partial: true,
        ext: path.extname(name) ?? '.html',
        req: this.component.req,
        reply: this.component.reply
      }
      const resp = this.app.bajoTemplate[camelCase(`resolve ${type}`)](name, opts)
      const content = fs.readFileSync(resp.file, 'utf8')
      if (!escape) return content
      return content.replaceAll("'", "\\'")
    }

    getProp = (name) => {
      const { find } = this.app.lib._
      const prop = find(this.schema.properties ?? [], { name }) ?? {}
      return prop
    }

    getRef = ({ field, refName, returning } = {}) => {
      const { get, find } = this.app.lib._
      const prop = find(this.schema.properties ?? [], p => p.name === field)
      if (!prop) return {}
      if (!refName) refName = this.getRefName(field)
      const key = refName ?? this.params.attr.refName
      const ref = get(prop, `ref.${key}`, {})
      if (returning === 'all') return { ref, key }
      else if (returning === 'key') return key
      return ref
    }

    getRefValue = ({ field, data, labelField, refName } = {}) => {
      const { get, isEmpty } = this.app.lib._
      const { ref, key } = this.getRef({ field, refName, returning: 'all' })
      if (isEmpty(ref)) return undefined
      labelField = labelField ?? ref.labelField ?? 'id'
      return get(data ?? this.formData, `_ref.${key}.${labelField}`)
    }

    getRefName = (field) => {
      const { get, find } = this.app.lib._
      const prop = find(this.schema.properties ?? [], p => p.name === field) ?? {}
      if (!prop.ref) return
      const keys = Object.keys(prop.ref)
      let refName = get(this.schema, `view.widget.${field}.attr.refName`, this.params.attr.refName)
      if (!refName) {
        if (keys.includes(field)) refName = field
        else if (field.endsWith('Id')) {
          refName = field.slice(0, -2)
          refName = keys.includes(refName) ? refName : undefined
        }
      }
      return refName
    }

    getSetting = (key, defValue) => {
      const { get, camelCase } = this.app.lib._
      const widgetName = camelCase(this.constructor.name)
      key = key.replaceAll('{self}', widgetName)
      const cfg = this.app.waibu.getSetting(`${this.plugin.ns}:${key}`, { defValue, req: this.component.req })
      return get(this.schema, `view.${key}`, cfg)
    }
  }

  this.app.baseClass.MpaWidget = MpaWidget
  return MpaWidget
}

export default widgetFactory
