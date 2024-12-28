import minifier from 'html-minifier-terser'

async function minify (text) {
  return await minifier.minify(text, {
    collapseWhitespace: true
  })
}

export default minify
