const wmpa = {
  url: '/wmpa.js',
  method: 'GET',
  handler: async function (req, reply) {
    const { getPluginPrefix } = this.app.waibu
    const prefix = {
      virtual: `/${getPluginPrefix('waibuStatic')}/${this.app.waibu.config.prefixVirtual}`,
      asset: `/${getPluginPrefix('waibuStatic')}`,
      main: `/${this.app.waibuStatic.config.mountMainAsRoot ? '' : getPluginPrefix('main')}`
    }
    return reply.view('waibuMpa.template:/wmpa.js', { prefix })
  }
}

export default wmpa
