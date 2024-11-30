import Factory from '../factory.js'

class PageEnd extends Factory {
  constructor (options) {
    super(options)
    const { generateId } = this.plugin.app.bajo

    this.params.tag = 'div'
    this.params.attr.c = 'page-end'
    this.params.id = generateId()
  }

  async build () {
    const { get } = this.plugin.app.bajo.lib._
    const { factory, locals, req } = this.component

    let btt = ''
    if (this.params.attr.backToTop) btt = await this.component.buildTag({ tag: 'btnBackToTop' })
    let tc = ''
    if (!this.params.attr.noToastContainer && factory.toastStack && factory.toast) {
      const toasts = []
      const err = get(locals, 'error')
      if (err) {
        const details = get(err, 'details', [])
        if (details.length > 0) {
          const list = [`<ul class="m-0 ${details.length === 1 ? 'list-unstyled' : ''}">`]
          for (const d of details) {
            const field = req.t(`field.${d.field}`)
            const msg = d.ext ? req.t(`validation.${d.ext.type}`, d.ext.context) : req.t(d.error)
            list.push(`<li><strong>${field}:</strong> ${msg}</li>`)
          }
          list.push('</ul>')
          const attr = {
            border: 'side:all width:0',
            text: 'background:danger',
            title: req.t(err.message)
          }
          toasts.push(await this.component.buildTag({ tag: 'toast', attr, html: list.join('\n') }))
        } else {
          const attr = { border: 'side:all width:0', text: 'background:danger' }
          toasts.push(await this.component.buildTag({ tag: 'toast', attr, html: this.req.t(err.message) }))
        }
      }
      const notifications = get(locals, '_meta.flash.notify', [])
      for (const item of notifications) {
        const [html, type] = item.split('\t')
        const attr = { border: 'side:all width:0', text: `background:${type ?? 'info'}` }
        toasts.push(await this.component.buildTag({ tag: 'toast', attr, html }))
      }
      tc = await this.component.buildTag({ tag: 'toastStack', html: toasts.join('\n') })
    }
    this.params.append = `${btt} ${tc}</body></html>`
    delete this.params.attr.noToastContainer
  }
}

export default PageEnd