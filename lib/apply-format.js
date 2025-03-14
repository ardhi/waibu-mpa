import { minify } from 'html-minifier-terser'
import * as prettier from 'prettier'
import * as emoji from 'node-emoji'
import buildPage from './build-page.js'

async function applyFormat ({ text, locals = {}, opts = {} } = {}) {
  const { without } = this.lib._
  const { ext } = opts
  const viewEngine = this.getViewEngine(ext)
  const exts = without(['.html', ...viewEngine.fileExts], '.js', '.css')

  if (this.config.emoji && exts.includes(ext)) text = emoji.emojify(text)
  if (exts.includes(ext)) text = await buildPage.call(this, { text, locals, opts })
  if (!opts.partial && this.config.prettier && exts.includes(ext)) text = await prettier.format(text, this.config.prettier)
  if (!opts.partial && this.config.minifier && ['.js', '.css', ...exts].includes(ext)) text = minify(text, this.config.minifier)
  return text
}

export default applyFormat
