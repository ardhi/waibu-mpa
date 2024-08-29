function renderToc (item, toc = [], opts = {}) {
  if (item[opts.keyChildren]) {
    toc.push(`<li><a href="${item[opts.keyPermalink]}">${item[opts.keyTitle]}</a><ul>`)
    for (const child of item[opts.keyChildren]) {
      renderToc.call(this, child, toc, opts)
    }
    toc.push('</ul></li>')
  } else toc.push(`<li><a href="${item[opts.keyPermalink]}">${item[opts.keyTitle]}</a></li>`)
}

async function tree ({ params } = {}) {
  const { base64JsonDecode } = this.mpa
  params.tag = 'ul'
  const keyTitle = params.attr['title-key'] ?? 'title'
  const keyPermalink = params.attr['permalink-key'] ?? 'permalink'
  const keyChildren = params.attr['children-key'] ?? 'children'
  const data = base64JsonDecode(params.attr.data)

  const toc = []
  for (const d of data) {
    renderToc.call(this.plugin, d, toc, { keyTitle, keyPermalink, keyChildren })
  }
  params.html = toc.join('\n')
  delete params.attr.data
}

export default tree
