import * as PIXI from "pixi.js";

const style = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 72,
  fontWeight: "bold",
  fill: ["#ffffff"],
  stroke: "#4a1850",
  dropShadow: true,
});

export default class Label {
  constructor(text,  customStyle = style) {
    this.text = new PIXI.Text(text, customStyle);
  }
  setX(x) {
    this.text.x = x
    return this
  }
  setY(y) {
    this.text.y = y
    return this
  }
  set(text) {
    this.text.text = text
    return this
  }
  get() {
    return this.text
  }
}