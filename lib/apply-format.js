import { minify } from 'html-minifier-terser'
import * as prettier from 'prettier'
import * as emoji from 'node-emoji'
import buildPage from './build-page.js'

async function applyFormat ({ text, ext, reply, locals = {}, opts = {} } = {}) {
  const { get, find } = this.app.bajo.lib._
  const viewEngine = this.getViewEngine(ext)
  const exts = ['.html', ...viewEngine.fileExts]

  let theme = find(this.themes, { name: get(reply, 'request.theme', opts.theme) })
  if (!theme) theme = find(this.themes, { name: 'default' })
  let iconset = find(this.iconsets, { name: get(reply, 'request.iconset', opts.iconset) })
  if (!iconset) iconset = find(this.iconsets, { name: 'default' })

  const parseMd = get(this, 'app.bajoMarkdown.parse')
  if (parseMd && (exts.includes('.md') || opts.markdown)) text = parseMd(text, this.config.markdown)
  if (this.config.emoji && exts.includes(ext)) text = emoji.emojify(text)
  if (exts.includes(ext)) text = await buildPage.call(this, { text, locals, theme, iconset, reply, partial: opts.partial })
  if (!opts.partial && this.config.prettier && exts.includes(ext)) text = await prettier.format(text, this.config.prettier)
  if (!opts.partial && this.config.minifier && ['.js', '.css', ...exts].includes(ext)) text = minify(text, this.config.minifier)
  return text
}

export default applyFormat
