import BaseFactory from '../base-factory.js'

class Any extends BaseFactory {
  build = async () => {
    const { htmlTags } = this.app.waibuMpa.constructor
    if (!htmlTags.includes(this.params.tag)) return false
  }
}

export default Any
