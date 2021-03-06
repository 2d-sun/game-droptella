import Label from "./label"
import localization from "../localization";


export default class Notification extends Label {
  constructor(localizationKey = "failed", options ={}) {
    super(localization[localizationKey], {
      fontSize: window.innerWidth * 0.3,
      wordWrap: true,
      wordWrapWidth: window.innerWidth/2,
      dropShadow: false,
      ...options
    })
    this.text.y = window.innerHeight/2 - this.text.height/2
    this.text.x = window.innerWidth/2
    this.text.anchor.set(0.5);
  }

  changeTo(label, index) {
    let loc = localization[label]

    if (index !== undefined) loc = loc[index]
    this.text.text = loc
    return this
  }

  changeToFn(label, args) {
    this.text.text = localization[label](...args)
    return this
  }

  chanseFontSize(fontSize) {
    this.text.style.fontSize = fontSize * window.innerWidth
    return this
  }
}