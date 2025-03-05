import { stripHtml } from 'string-strip-html'

function stripHtmlTags (html, options = {}) {
  const { result } = stripHtml(html, options)
  return result
}

export default stripHtmlTags
