async function waibuMpaThemeAfterInjectScripts ({ items }) {
  items.push(`$${this.name}:/wmpa/wmpa.js`)
}

export default waibuMpaThemeAfterInjectScripts
