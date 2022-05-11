import { Entity } from "./entity"
import { Body, Box } from "p2";
import GROUPS from "./groups"

export default class House extends Entity {
  constructor(dict, visual) {
    super(dict, visual)

    this.name = GROUPS.HOUSE
    this.#init(dict.options)
  }

  #init({position}) {
    const height = 0.6
    const width  = 0.3

    this.dict.body = new Body({
      mass: 25,
      position,
      fixedRotation: true,
      fixedY: true
    });
    
    this.dict.body.addShape(new Box({
      width,
      height,
    }));

    this.body = this.dict.body
  }
}
