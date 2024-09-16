function isAlpinejs (key) {
  return this.app.waibuAlpinejs && (key.startsWith('x-') || key.includes(':'))
}

export default isAlpinejs
