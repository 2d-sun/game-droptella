import Label from "./label"
import localization from "../localization";

class Catched extends Label {
  constructor(customStyle = {}) {
    super(`${localization.catched}: 0`, {...customStyle, dropShadow: false})
    this.donate = 0
    this.topKo = 0.04
    this.text.y = window.innerHeight * this.topKo
  }
  update(newValue) {
    this.set(`${localization.catched}: ${newValue}`)
    return this
  }
  increment() {
    this.donate++
    return this
  }
  incrementAndUpdate() {
    this.increment()
    this.update(this.donate)
    return this
  }
}


export default new Catched()