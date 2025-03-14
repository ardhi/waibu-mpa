import Factory from '../factory.js'

class Any extends Factory {
  build = async () => {
    const { htmlTags } = this.plugin.app.waibuMpa
    if (!htmlTags.includes(this.params.tag)) return false
  }
}

export default Any
