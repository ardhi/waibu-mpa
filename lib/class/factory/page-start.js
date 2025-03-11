import Factory from '../factory.js'

class PageStart extends Factory {
  constructor (options) {
    super(options)
    const { generateId } = this.plugin.app.bajo
    const { escape } = this.plugin.app.waibu
    this.component.normalizeAttr(this.params)

    this.params.tag = 'div'
    this.params.attr.c = 'page-start'
    this.params.attr.id = generateId()
    this.params.attr.prepend = escape('<!DOCTYPE html><html><head>')
    this.params.attr.append = escape('</head><body>')
  }
}

export default PageStart
