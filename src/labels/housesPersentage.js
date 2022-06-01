import Label from "./label"
import localization from "../localization";

class HousesPersentage extends Label {
  constructor(customStyle) {
    super(`${localization.housesPersentage}: 100%`, customStyle)
    this.persentage = 0
    this.topKo = 0.1
    this.text.y = window.innerHeight * this.topKo
  }
  update(newValue) {
    this.set(`${localization.housesPersentage}: ${newValue}%`)
    return this
  }
}


export default new HousesPersentage()