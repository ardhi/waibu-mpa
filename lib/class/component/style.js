async function style ({ params }) {
  const { kebabCase, camelCase } = this._
  params.tag = 'style'
  let html = params.html
  for (const item in this.selector) {
    html = html.replace(camelCase(item), this.selector[item])
      .replace(kebabCase(item), this.selector[item])
  }
  params.html = html
}

export default style
