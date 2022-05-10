import * as PIXI from "pixi.js";
import Label from "./label"
import localization from "../localization";

const style = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 72,
  fontWeight: "bold",
  fill: ["#ffffff"],
  stroke: "#4a1850",
  dropShadow: true,
});


console.log("bbbb", localization.default)

class Donates extends Label {
  constructor(customStyle = style) {
    super(`${localization.donates}: 0`, customStyle)
    this.donate = 0
    this.text.y = 50
  }
  update(newValue) {
    this.set(`${localization.donates}: ${newValue}`)
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


export default new Donates()