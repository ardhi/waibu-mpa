async function waibuMpaThemeAfterInjectScripts ({ items }) {
  items.push(`${this.name}.virtual:/json2csv/json2csv.js`)
  items.push(`$${this.name}:/wmpa.js`)
}

export default waibuMpaThemeAfterInjectScripts
