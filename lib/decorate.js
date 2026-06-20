async function decorate () {
  const cfg = this.config
  const me = this
  this.webAppCtx.decorateRequest('theme', cfg.theme.set)
  this.webAppCtx.decorateRequest('iconset', cfg.iconset.set)
  this.webAppCtx.decorateRequest('darkMode', cfg.darkMode.set)
  this.webAppCtx.decorateRequest('referer', '')
  this.webAppCtx.decorateReply('ctags', null)
  this.webAppCtx.decorateReply('view', async function (tpl, params = {}, opts = {}) {
    return await me.renderView({ reply: this, tpl, params, opts })
  })
}

export default decorate
