class Localization {
  static ALLOWED = ["en","uk"]
  static DEFAULT = "uk"

  constructor() {
    const p = new URL(location.href).pathname.split("/")
    this.localization = p[0] || p[1]
    if (!Localization.ALLOWED.includes(this.localization)) {
      console.error(`Language is not supported. Use one of [${Localization.ALLOWED.join()}]. Used: ${this.localization}`)
      this.localization = Location.DEFAULT
    }
  }
  get() {
    return require(`./${this.localization}.js`).default
  }
}

export default new Localization().get()