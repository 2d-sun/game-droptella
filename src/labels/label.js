import * as PIXI from "pixi.js";

export default class Label {
  constructor(text, customStyle = {}) {

    const fontSize = window.innerWidth * 0.01

    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize,
      fontWeight: "bold",
      fill: ["#bbbbbb"],
      stroke: "#4a1850",
      zIndex: 500,
      dropShadow: true,
      ...customStyle
    });


    this.text = new PIXI.Text(text, style);
    this.text.roundPixels = true

    this.#listenResize()
  }

  setAnchor(anchor) {
    this.text.anchor.set(anchor);
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

  setStyle(style) {
    this.text.style = {
      ...this.text.style,
      ...style
    }
    return this.text
  }

  #listenResize() {
    window.addEventListener("resize", () => {
      requestAnimationFrame(() => {
        this.setStyle({fontSize: window.innerWidth * 0.01})
        this.setY(window.innerHeight * this.topKo)
        if (this.yes) {
          console.log(this.text.y)
        }
      })
    })
  }
}