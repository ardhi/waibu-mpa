async function init () {
  const { trim } = this.app.bajo.lib._
  this.config.waibu = this.config.waibu ?? {}
  this.config.waibu.prefix = trim(this.config.waibu.prefix, '/')
}

export default init
