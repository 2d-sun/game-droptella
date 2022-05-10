import Label from "./label"
import localization from "../localization";

class Missed extends Label {
  constructor(customStyle) {
    super(`${localization.missed}: 0`, customStyle)
    this.missed = 0
    this.text.y = 300
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