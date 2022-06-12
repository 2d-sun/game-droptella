import { Entity } from "./entity"
import { Body, Box } from "p2";
import GROUPS from "./groups"

export default class Umbrella extends Entity {
  constructor(dict, visual) {
    super(dict, visual)

    this.name = GROUPS.UMBRELLA
    this.width = 0.5
    this.#init()
  }

  #init() {
    const options = this.dict.options

    this.width += this.dict.options.widthInc || 0
    
    const width  = (window.innerWidth/1000*(this.width))
    const height = window.innerHeight/10000*3

    this.dict.body = new Body({
      mass: 9999,
      position: [options.xmax/2, options.ymin + height + options.houseHeight * 2],
      fixedRotation: true,
      fixedY: true,
      velocity: [0, 0],
      damping: 0,
    });
    
    this.dict.body.addShape(new Box({
      width,
      height,
      // collisionGroup: GROUPS.UMBRELLA,
      // collisionMask: GROUPS.DROP
    }));
    this.body = this.dict.body
    this.body.color = 0xffffff
  }
}
