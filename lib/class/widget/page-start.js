async function pageStartFactory () {
  class PageStart extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      this.readBlock()
    }

    build = async (options) => {
      const { generateId } = this.app.lib.aneka
      const { escape } = this.app.waibu
      const { groupAttrs, stringifyAttribs } = this.app.waibuMpa
      this.params.tag = 'div'
      const groups = groupAttrs(this.params.attr, ['body'])
      this.params.attr = groups._
      this.params.attr.c = 'page-start'
      this.params.attr.id = generateId()
      const body = `<body ${stringifyAttribs(groups.body)}>`
      this.params.attr.prepend = escape('<!DOCTYPE html><html><head>')
      this.params.attr.append = escape(`</head>${body}`)
    }
  }
  return PageStart
}

export default pageStartFactory
