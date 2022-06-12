import { Entity } from "./entity"
import { Body, Box } from "p2";
import GROUPS from "./groups"

export default class House extends Entity {
  constructor(dict, visual) {
    super(dict, visual)

    this.name = GROUPS.HOUSE
    this.#init(dict.options)
  }

  #init({position, height = 0.3, width = 0.15}) {
    this.dict.body = new Body({
      mass: 1000,
      position,
      fixedRotation: true,
      // fixedY: true,
      fixedX: true,
      //gravityScale: 0,
    });
    
    this.dict.body.addShape(new Box({
      width,
      height,
    }));

    this.body = this.dict.body
  }
}
