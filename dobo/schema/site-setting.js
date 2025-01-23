async function siteSettings () {
  let siteId = {
    name: 'siteId',
    type: 'string',
    maxLength: 50,
    index: true
  }
  if (this.app.sumba) siteId = { name: 'siteId', type: 'sumba.siteId' }
  const schema = {
    properties: [{
      name: 'theme',
      type: 'string',
      maxLength: 50
    }, {
      name: 'iconset',
      type: 'string',
      maxLength: 50
    }, {
      name: 'allowUserOverride',
      type: 'boolean',
      default: false
    }, siteId],
    feature: ['updatedAt']
  }
  return schema
}

export default siteSettings
