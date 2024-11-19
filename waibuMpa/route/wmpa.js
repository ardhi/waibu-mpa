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
    const apiExt = this.app.waibuRestApi.config.format.asExt ? '.json' : ''
    const apiTokenKey = this.app.sumba.config.auth.common.jwt.headerKey
    return reply.view('waibuMpa.template:/wmpa.js', { prefix, accessTokenUrl, renderUrl, apiExt, apiTokenKey })
  }
}

export default wmpa
