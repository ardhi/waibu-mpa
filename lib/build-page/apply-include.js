function applyInclude ($) {
  const { forOwn } = this.app.bajo.lib._
  // c:include hacks
  const incs = {}
  $('div[c=include]').each(function () {
    incs[this.attribs.id] = {
      before: this.attribs.before,
      after: this.attribs.after,
      html: $(this).html()
    }
    $(this).replaceWith(this.attribs.id)
  })
  let text = $.root().html()
  forOwn(incs, (v, k) => {
    text = text.replace(k, `${v.before ?? ''}${v.html}${v.after ?? ''}`)
  })
  return text
}

export default applyInclude
