import replaceTag from './replace-tag.js'

async function traverse ({ el, cmp, reply, locals = {} } = {}) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await traverse.call(me, { el: child, cmp, reply, locals })
      if (child.name.startsWith(cmp.namespace)) await replaceTag.call(me, { el: child, cmp, reply, locals })
    }
  }
}

export default traverse
