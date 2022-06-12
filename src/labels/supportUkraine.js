import * as PIXI from "pixi.js";
import localization from "../localization";


export default class SupportUkraineLabel {
  constructor(name, {x, y, anchor=0.5, topKo = 0.5}) {

    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: window.innerWidth * 0.02,
      fontWeight: "bold",
      fill: ["#fff"],
      stroke: "#fff",
      cursor: "pointer",
      zIndex: 500,
      wordWrap: true,
      wordWrapWidth: window.innerWidth/2,
    });

    this.text = new PIXI.Text(localization[name].text, style);
    this.text.roundPixels = true
    this.text.y = y || topKo * window.innerWidth
    this.text.x = x
    this.text.anchor.set(anchor);

    this.text.interactive = true;
    this.text.click = (e) => {
      e.stopPropagation()
      window.open(localization[name].url)
    };
  }
}