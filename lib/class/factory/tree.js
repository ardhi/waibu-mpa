import BaseFactory from '../base-factory.js'

function renderToc (item, toc = [], opts = {}) {
  if (item[opts.keyChildren]) {
    toc.push(`<li><a href="${item[opts.keyPermalink]}">${item[opts.keyTitle]}</a><ul>`)
    for (const child of item[opts.keyChildren]) {
      renderToc.call(child, toc, opts)
    }
    toc.push('</ul></li>')
  } else toc.push(`<li><a href="${item[opts.keyPermalink]}">${item[opts.keyTitle]}</a></li>`)
}

class Tree extends BaseFactory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    this.params.tag = 'ul'
  }

  build = async () => {
    const { base64JsonDecode } = this.plugin.app.waibuMpa
    const keyTitle = this.params.attr['title-key'] ?? 'title'
    const keyPermalink = this.params.attr['permalink-key'] ?? 'permalink'
    const keyChildren = this.params.attr['children-key'] ?? 'children'
    const data = base64JsonDecode(this.params.attr.items)

    const toc = []
    for (const d of data) {
      renderToc.call(this.plugin, d, toc, { keyTitle, keyPermalink, keyChildren })
    }
    this.params.html = toc.join('\n')
    delete this.params.attr.items
  }
}

export default Tree
