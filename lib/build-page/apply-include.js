function applyInclude ($) {
  const { unescape } = this.app.bajo
  const { forOwn } = this.app.bajo.lib._
  // c:include hacks
  const incs = {}
  $('div[c=include], div[c=page-start], div[c=page-end]').each(function () {
    incs[this.attribs.id] = {
      prepend: this.attribs.prepend,
      append: this.attribs.append,
      html: $(this).html()
    }
    $(this).replaceWith(this.attribs.id)
  })
  let text = $.root().html()
  forOwn(incs, (v, k) => {
    text = text.replace(k, `${unescape(v.prepend ?? '')}${v.html}${unescape(v.append ?? '')}`)
  })
  return text
}

export default applyInclude
