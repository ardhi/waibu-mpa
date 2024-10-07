async function waibuMpaThemeAfterInjectScripts ({ items }) {
  items.push(`$${this.name}:/wmpa.js`)
}

export default waibuMpaThemeAfterInjectScripts
