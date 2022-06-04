import * as PIXI from "pixi.js";
import Label from "./label"
import localization from "../localization";


class Failed extends Label {
  constructor() {
    super(localization.failed, {fontSize: window.innerWidth * 0.3})
    this.text.y = window.innerHeight/2 - 200
    this.text.x = window.innerWidth/2 - 200
  }

  changeTo(label) {
    this.text.text = localization[label]
    return this
  }

  chanseFontSize(fontSize) {
    this.text.style.fontSize = fontSize * window.innerWidth
    return this
  }
}


export default new Failed()