import * as PIXI from "pixi.js";
import Label from "./label"
import localization from "../localization";


class Failed extends Label {
  constructor() {
    super(localization.failed, {fontSize: 50})
    this.text.y = window.innerHeight/2 - 50
    this.text.x = window.innerWidth/2 - 50
  }

  changeTo(label) {
    this.text.text = localization[label]
  }
}


export default new Failed()