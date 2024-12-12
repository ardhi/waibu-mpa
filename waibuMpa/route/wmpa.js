const wmpa = {
  url: '/wmpa.js',
  method: 'GET',
  handler: async function (req, reply) {
    const { trim } = this.app.bajo.lib._
    const { getPluginPrefix } = this.app.waibu
    const prefix = {
      virtual: `/${getPluginPrefix('waibuStatic')}/${this.app.waibu.config.prefixVirtual}`,
      asset: `/${getPluginPrefix('waibuStatic')}`,
      main: `/${this.app.waibuStatic.config.mountMainAsRoot ? '' : getPluginPrefix('main')}`
    }
    const mpaPrefix = this.app.waibuMpa.config.waibu.prefix
    const sumbaPrefix = this.app.sumba.config.waibu.prefix
    const accessTokenUrl = '/' + trim(`/${mpaPrefix}/${sumbaPrefix}/access-token`, '/')
    const renderUrl = '/' + trim(`/${mpaPrefix}/component/render`, '/')
    const api = {
      prefix: this.app.waibuRestApi.config.waibu.prefix,
      ext: this.app.waibuRestApi.config.format.asExt ? '.json' : '',
      headerKey: this.app.sumba.config.auth.common.jwt.headerKey,
      dataKey: this.app.waibuRestApi.config.responseKey.data,
      rateLimitDelay: 2000,
      rateLimitRetry: 2
    }
    const formatOpts = this.app.bajoI18N.config.format
    const params = { prefix, accessTokenUrl, renderUrl, api, formatOpts }
    return reply.view('waibuMpa.template:/wmpa.js', params)
  }
}

export default wmpa
