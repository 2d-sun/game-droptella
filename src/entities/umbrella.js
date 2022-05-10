import { Entity } from "./entity"
import { Body, Box } from "p2";
import GROUPS from "./groups"

export default class Umbrella extends Entity {
  constructor(dict, visual) {
    super(dict, visual)

    this.name = GROUPS.UMBRELLA
    this.#init()
  }

  #init() {
    const options = this.dict.options

    const height = 0.1
    const width  = 0.3

    this.dict.body = new Body({
      mass: 1000,
      position: [options.xmax/2, options.ymin + (height * 5) ],
      fixedRotation: true,
      fixedY: true
    });
    
    this.dict.body.addShape(new Box({
      width,
      height,
      // collisionGroup: GROUPS.UMBRELLA,
      // collisionMask: GROUPS.DROP
    }));

    this.body = this.dict.body
  }
}
