import BaseFactory from '../base-factory.js'

class Any extends BaseFactory {
  build = async () => {
    const { htmlTags } = this.plugin.app.waibuMpa
    if (!htmlTags.includes(this.params.tag)) return false
  }
}

export default Any
