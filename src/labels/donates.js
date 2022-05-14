import Label from "./label"
import localization from "../localization";


class Donates extends Label {
  constructor(customStyle) {
    super(`${localization.donates}: 0`, customStyle)
    this.donate = 0
    this.topKo = 0.01
    this.text.y = window.innerHeight * this.topKo
  }
  update(newValue) {
    this.set(`${localization.donates}: ${newValue}`)
    return this
  }
  add(income) {
    this.donate += income
  }
  addAndUpdate(income) {
    this.add(income)
    this.update(this.donate)
    return this
  }
}


export default new Donates()