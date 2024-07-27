import { minify } from 'html-minifier-terser'
import * as prettier from 'prettier'
import * as emoji from 'node-emoji'
import parseComponents from './parse-components.js'

async function applyFormat ({ text, ext, reply, opts = {} } = {}) {
  const { get, find } = this.app.bajo.lib._
  const viewEngine = this.getViewEngine(ext)
  const exts = ['.html', ...viewEngine.fileExts]
  const themeName = get(reply, 'request.theme', opts.theme)
  let theme = find(this.themes, { name: themeName })
  if (!theme) theme = find(this.themes, { name: 'default' })

  const parseMd = get(this, 'app.bajoMarkdown.parse')
  if (parseMd && (exts.includes('.md') || opts.markdown)) text = parseMd(text)
  if (this.config.emoji && exts.includes(ext)) text = emoji.emojify(text)
  if (exts.includes(ext)) text = await parseComponents.call(this, text, theme, reply, opts.partial)
  if (!opts.partial && this.config.prettier && exts.includes(ext)) text = await prettier.format(text, this.config.prettier)
  if (!opts.partial && this.config.minify && ['.js', '.css', ...exts].includes(ext)) text = minify(text, this.config.minify)
  return text
}

export default applyFormat
