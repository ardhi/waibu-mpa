import Factory from '../factory.js'

class PageStart extends Factory {
  constructor (options) {
    super(options)
    this.readBlock()
  }

  build = async (options) => {
    const { generateId } = this.plugin.app.bajo
    const { escape } = this.plugin.app.waibu
    const { groupAttrs, attribsStringify } = this.plugin.app.waibuMpa
    this.params.tag = 'div'
    const groups = groupAttrs(this.params.attr, ['body'])
    this.params.attr = groups._
    this.params.attr.c = 'page-start'
    this.params.attr.id = generateId()
    const body = `<body ${attribsStringify(groups.body)}>`
    this.params.attr.prepend = escape('<!DOCTYPE html><html><head>')
    this.params.attr.append = `</head>${body}`
  }
}

export default PageStart
