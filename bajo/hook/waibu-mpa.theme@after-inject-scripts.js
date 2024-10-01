async function waibuMpaThemeAfterInjectScripts ({ items }) {
  items.push(`$${this.name}.asset:/js/wmpa.js`)
}

export default waibuMpaThemeAfterInjectScripts
