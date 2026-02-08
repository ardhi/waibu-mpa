async function theme () {
  const css = [
    'waibuMpa.virtual:/purecss/pure-min.css'
  ]
  const meta = [{
    name: 'viewport',
    content: 'width=device-width, initial-scale=1'
  }]
  return {
    name: 'default',
    css,
    meta
  }
}

export default theme
