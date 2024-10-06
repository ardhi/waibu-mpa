const wmpa = {
  url: '/wmpa.js',
  method: 'GET',
  handler: async function (req, reply) {
    const prefix = {
      virtual: `/${this.app.waibuStatic.config.prefix}/${this.app.waibu.config.prefixVirtual}`,
      asset: `/${this.app.waibuStatic.config.prefix}`,
      main: `/${this.app.waibuStatic.config.mountMainAsRoot}`
    }
    return reply.view('waibuMpa.template:/wmpa.js', { prefix })
  }
}

export default wmpa
