export function printScript (script) {
  const { routePath } = this.app.waibu
  return `<script src="${routePath(script)}"></script>`
}

export async function collectRegular (type, transformer, options = {}) {
  const { runHook, arrangeArray } = this.app.bajo
  const { map, get, isString, camelCase, uniq } = this.lib._
  const { req } = options

  let items = []
  // find in theme/iconset
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert[type]) {
      const rsc = get(options, `${item}.${type}`, [])
      const opts = { items, req }
      opts[type] = rsc
      await runHook(`${this.name}.${item}:${camelCase(`before inject ${type}`)}`, opts)
      if (rsc) items.push(...rsc)
      await runHook(`${this.name}.${item}:${camelCase(`after inject ${type}`)}`, opts)
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
  const { isEmpty, get, camelCase, uniq } = this.lib._
  const { req } = options
  const items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert[type]) {
      const rsc = get(options, `${item}.${camelCase(type)}`)
      const opts = { items, req }
      opts[type] = rsc
      await runHook(`${this.name}.${item}:${camelCase(`before inject ${type}`)}`, opts)
      if (rsc) items.push(rsc)
      await runHook(`${this.name}.${item}:${camelCase(`after inject ${type}`)}`, opts)
    }
  }
  // find in options
  if (!isEmpty(options[type])) items.push(...options[type])
  return uniq(items)
}

async function script (options = {}) {
  const { $ } = options
  const regular = await collectRegular.call(this, 'scripts', printScript, options)
  if (regular.length > 0) $('body').append(regular.join('\n'))
  const inline = await collectInline.call(this, 'inlineScript', options)
  if (inline.length > 0) $('body').append(`<script>\n${inline.join('\n')}\n</script>`)
}

export default script
