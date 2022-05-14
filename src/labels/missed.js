import Label from "./label"
import localization from "../localization";

class Missed extends Label {
  constructor(customStyle) {
    super(`${localization.missed}: 0`, customStyle)
    this.missed = 0
    this.topKo = 0.07
    this.text.y = window.innerHeight * this.topKo
  }
  update(newValue) {
    this.set(`${localization.missed}: ${newValue}`)
    return this
  }
  increment() {
    this.missed++
    return this
  }
  incrementAndUpdate() {
    this.increment()
    this.update(this.missed)
    return this
  }
}


export default new Missed()