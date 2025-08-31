const wmpa = {
  url: '/wmpa.js',
  method: 'GET',
  handler: async function (req, reply) {
    const { get, trim } = this.app.lib._
    const { getPluginPrefix } = this.app.waibu
    const { importModule } = this.app.bajo
    const { types: formatTypes, formats } = await importModule('bajo:/lib/formats.js', { asDefaultImport: false })
    const prefix = {
      virtual: `/${getPluginPrefix('waibuStatic')}/${this.app.waibu.config.prefixVirtual}`,
      asset: `/${getPluginPrefix('waibuStatic')}`,
      main: `/${getPluginPrefix('main')}`
    }
    const mpaPrefix = get(this, 'app.waibuMpa.config.waibu.prefix')
    const renderUrl = '/' + trim(`/${mpaPrefix}/component/render`, '/')
    let accessTokenUrl = ''
    let api = {}
    if (this.app.sumba) {
      const sumbaPrefix = get(this, 'app.sumba.config.waibu.prefix')
      accessTokenUrl = '/' + trim(`/${mpaPrefix}/${sumbaPrefix}/access-token`, '/')
      api = {
        prefix: this.app.waibuRestApi ? this.app.waibuRestApi.config.waibu.prefix : '',
        ext: this.app.waibuRestApi ? (this.app.waibuRestApi.config.format.asExt ? '.json' : '') : '',
        headerKey: this.app.waibuRestApi ? this.app.sumba.config.auth.common.jwt.headerKey : '',
        dataKey: this.app.waibuRestApi ? this.app.waibuRestApi.config.responseKey.data : '',
        rateLimitDelay: 2000,
        rateLimitRetry: 2
      }
    }
    const formatOpts = this.app.bajo.config.intl.format
    const params = { prefix, accessTokenUrl, renderUrl, api, formatOpts, formatTypes, formats }
    return await reply.view('waibuMpa.template:/wmpa.js', params)
  }
}

export default wmpa
