async function anyFactory () {
  class Any extends this.app.baseClass.MpaWidget {
    build = async () => {
      const { htmlTags } = this.app.waibuMpa.constructor
      if (!htmlTags.includes(this.params.tag)) return false
    }
  }

  return Any
}

export default anyFactory
