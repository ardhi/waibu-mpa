async function pageEnd (params = {}) {
  const { generateId } = this.plugin.app.bajo
  const { get } = this.plugin.app.bajo.lib._

  params.tag = 'div'
  params.attr.c = 'page-end'
  params.id = generateId()
  let btt = ''
  if (params.attr.backToTop) btt = await this.buildTag({ tag: 'btnBackToTop' })
  let tc = ''
  if (!params.attr.noToastContainer && this.factory.toastStack && this.factory.toast) {
    const toasts = []
    const err = get(this, 'locals.error')
    if (err) {
      const details = get(err, 'details', [])
      if (details.length > 0) {
        const list = [`<ul class="m-0 ${details.length === 1 ? 'list-unstyled' : ''}">`]
        for (const d of details) {
          const field = this.req.t(`field.${d.field}`)
          const msg = d.ext ? this.req.t(`validation.${d.ext.type}`, d.ext.context) : this.req.t(d.error)
          list.push(`<li><strong>${field}:</strong> ${msg}</li>`)
        }
        list.push('</ul>')
        const attr = {
          border: 'side:all width:0',
          text: 'background:danger',
          title: this.req.t(err.message)
        }
        toasts.push(await this.buildTag({ tag: 'toast', attr, html: list.join('\n') }))
      } else {
        const attr = { border: 'side:all width:0', text: 'background:danger' }
        toasts.push(await this.buildTag({ tag: 'toast', attr, html: this.req.t(err.message) }))
      }
    }
    const notifications = get(this, 'locals._meta.flash.notify', [])
    for (const item of notifications) {
      const [html, type] = item.split('\t')
      const attr = { border: 'side:all width:0', text: `background:${type ?? 'info'}` }
      toasts.push(await this.buildTag({ tag: 'toast', attr, html }))
    }
    tc = await this.buildTag({ tag: 'toastStack', html: toasts.join('\n') })
  }
  params.append = `${btt} ${tc} </body></html>`
  delete params.attr.noToastContainer
}

export default pageEnd
