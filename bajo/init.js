async function init () {
  const { trim } = this.app.bajo.lib._
  this.config.prefix = trim(this.config.prefix, '/')
}

export default init
