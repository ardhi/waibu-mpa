const wmpa = {
  url: '/wmpa.js',
  method: 'GET',
  handler: async function (req, reply) {
    const { getAppPrefix } = this.app.waibu
    const prefix = {
      virtual: `/${getAppPrefix('waibuStatic')}/${this.app.waibu.config.prefixVirtual}`,
      asset: `/${getAppPrefix('waibuStatic')}`,
      main: `/${this.app.waibuStatic.config.mountMainAsRoot ? '' : getAppPrefix('main')}`
    }
    return reply.view('waibuMpa.template:/wmpa.js', { prefix })
  }
}

export default wmpa
