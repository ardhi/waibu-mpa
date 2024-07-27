function objectToAttrs (obj = {}) {
  const { isSet } = this.app.bajo
  const { forOwn } = this.app.bajo.lib._
  const attrs = []
  forOwn(obj, (v, k) => {
    if (isSet(v)) attrs.push(`${k}="${v}"`)
    else attrs.push(`${k}`)
  })
  return attrs.join(' ')
}

export default objectToAttrs
