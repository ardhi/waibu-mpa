async function toolsFactory () {
  class MpaTools extends this.app.baseClass.Tools {
  }

  this.app.baseClass.MpaTools = MpaTools
  return MpaTools
}

export default toolsFactory
