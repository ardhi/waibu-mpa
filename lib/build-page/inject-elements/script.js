export function printScript (script) {
  const { routePath } = this.app.waibu
  const { stringifyAttribs } = this.app.waibuMpa
  const { isString, omit } = this.app.lib._
  if (isString(script)) script = { src: script }
  return `<script src="${routePath(script.src)}" ${stringifyAttribs(omit(script, ['src']))}></script>`
}

export async function collectRegular (type, transformer, options = {}) {
  const { runHook } = this.app.bajo
  const { map, get, isString, camelCase, uniq } = this.app.lib._
  const { arrangeArray } = this.app.lib.aneka
  const { req } = options

  let items = []
  // find in theme/iconset
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert[type]) {
      const rsc = get(options, `${item}.${type}`, [])
      const opts = { items, req }
      opts[type] = rsc
      await runHook(`${this.ns}.${item}:${camelCase(`before inject ${type}`)}`, opts)
      if (rsc) items.push(...rsc)
      await runHook(`${this.ns}.${item}:${camelCase(`after inject ${type}`)}`, opts)
    }
  }
  // find in frontmatter
  let fm = get(options, `locals.page.${type}`, [])
  if (isString(fm)) fm = [fm]
  items.push(...fm)
  // find in options
  items.push(...options[type])
  items = arrangeArray(items)
  return uniq(map(items, i => transformer.call(this, i)))
}

export async function collectInline (type, options = {}) {
  const { runHook } = this.app.bajo
  const { isEmpty, get, camelCase, uniq, trim } = this.app.lib._
  const { $, req } = options
  const items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert[type]) {
      const rsc = get(options, `${item}.${camelCase(type)}`)
      const opts = { items, req }
      opts[type] = rsc
      await runHook(`${this.ns}.${item}:${camelCase(`before inject ${type}`)}`, opts)
      if (rsc) items.push(rsc)
      await runHook(`${this.ns}.${item}:${camelCase(`after inject ${type}`)}`, opts)
    }
  }
  // find in options
  if (!isEmpty(options[type])) items.push(...options[type])
  $(type === 'inlineCss' ? 'style' : 'script').each(function () {
    const item = trim($(this).html())
    if (!isEmpty(item)) {
      items.push(item)
      $(this).remove()
    }
  })
  return uniq(items)
}

async function script (options = {}) {
  const { $, cmp, locals } = options
  const { render } = this.app.bajoTemplate
  const parent = this.config.page.scriptsAtEndOfBody ? 'body' : 'head'
  const regular = await collectRegular.call(this, 'scripts', printScript, options)
  if (regular.length > 0) $(parent).append(regular.join('\n'))
  const inline = await collectInline.call(this, 'inlineScript', options)
  if (inline.length > 0) cmp.scriptBlock.root.push(...inline)
  const script = await render(locals.page.scriptBlock, { block: cmp.scriptBlock }, { default: 'bajoTemplate.partial:/script-block.html' })
  $(parent).append(script)
}

export default script
