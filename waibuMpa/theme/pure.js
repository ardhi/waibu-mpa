function pure (ctx) {
  const css = [
    'waibuMpa.virtual:/pure/pure-min.css',
    'waibuMpa.virtual:/pure/grids-responsive-min.css',
    'waibuMpa.asset:/css/pure-ext.css'
  ]
  const meta = [{
    name: 'viewport',
    content: 'width=device-width, initial-scale=1'
  }]
  return {
    name: 'pure',
    css,
    meta
  }
}

export default pure
