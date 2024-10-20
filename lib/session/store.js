import { EventEmitter } from 'events'
import util from 'util'

function Store (plugin, options = {}) {
  this.plugin = plugin
  this.model = 'WmpaSession'
  EventEmitter.call(this)
}

util.inherits(Store, EventEmitter)
const opts = { noHook: true, noCache: true, noValidation: true, dataOnly: true }

Store.prototype.set = function (sessionId, session, callback) {
  const { log } = this.plugin.app.waibuMpa
  const { recordGet, recordCreate, recordUpdate } = this.plugin.app.dobo
  const sess = JSON.stringify(session)
  recordGet(this.model, sessionId, { thrownNotFound: false })
    .then(item => {
      if (!item) return recordCreate(this.model, { id: sessionId, session: sess }, opts)
      return recordUpdate(this.model, sessionId, { session: sess }, opts)
    })
    .then(item => {
      callback()
    })
    .catch(err => {
      log.error('Session error: [%s] %s', 'SET', err.message)
      callback()
    })
}

Store.prototype.get = function (sessionId, callback) {
  const { log } = this.plugin.app.waibuMpa
  const { recordGet } = this.plugin.app.dobo
  recordGet(this.model, sessionId, opts)
    .then(item => {
      callback(null, item.session)
    })
    .catch(err => {
      log.error('Session error: [%s] %s', 'GET', err.message)
      callback()
    })
}

Store.prototype.destroy = function (sessionId, callback) {
  const { log } = this.plugin.app.waibuMpa
  const { recordRemove } = this.plugin.app.dobo
  recordRemove(this.model, sessionId, opts)
    .then(item => {
      callback()
    })
    .catch(err => {
      log.error('Session error: [%s] %s', 'DESTROY', err.message)
      callback()
    })
}

// TODO: clear expired sessions
Store.prototype.clearExpired = function (callback) {
}

export default Store
