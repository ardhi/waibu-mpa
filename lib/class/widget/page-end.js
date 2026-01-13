async function pageEndFactory () {
  class PageEnd extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      this.component.normalizeAttr(this.params)
      const { generateId } = this.app.lib.aneka

      this.params.tag = 'div'
      this.params.attr.c = 'page-end'
      this.params.id = generateId()
    }

    build = async () => {
      const { get } = this.app.lib._
      const { groupAttrs } = this.app.waibuMpa
      const { widget, locals, req } = this.component

      const group = groupAttrs(this.params.attr, ['toast'])

      let btt = ''
      if (this.params.attr.backToTop) btt = await this.component.buildTag({ tag: 'btnBackToTop' })

      let tc = ''
      if (!this.params.attr.noToastContainer && widget.toastStack && widget.toast) {
        const toasts = []
        if (get(locals, 'error')) {
          const details = get(locals.error, 'details', [])
          if (details.length > 0) {
            const list = [`<ul class="m-0 ${details.length === 1 ? 'list-unstyled' : ''}">`]
            for (const d of details) {
              const field = req.t(`field.${d.field}`)
              list.push(`<li><strong>${field}:</strong> ${d.error}</li>`)
            }
            list.push('</ul>')
            const attr = {
              border: 'side:all width:0',
              text: 'background:danger',
              title: req.t(locals.error.orgMessage ?? locals.error.message)
            }
            toasts.push(await this.component.buildTag({ tag: 'toast', attr, html: list.join('\n') }))
          } else if (!(locals._meta.statusCode === 404 || locals._meta.statusCode >= 500)) {
            const attr = { border: 'side:all width:0', text: 'background:danger' }
            toasts.push(await this.component.buildTag({ tag: 'toast', attr, html: locals.error.message }))
          }
        }
        const notifications = get(locals, '_meta.flash.notify', [])
        for (const item of notifications) {
          const [html, type] = item.split('\t')
          const attr = { border: 'side:all width:0', text: `background:${type ?? 'info'}` }
          toasts.push(await this.component.buildTag({ tag: 'toast', attr, html }))
        }
        tc = await this.component.buildTag({ tag: 'toastStack', attr: group.toast, html: toasts.join('\n') })
      }
      this.readBlock()
      this.params.append = `
        ${btt} ${tc}
      </body></html>
      `
      delete this.params.attr.noToastContainer
    }
  }

  return PageEnd
}

export default pageEndFactory
