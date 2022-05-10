import { Entity } from "./entity"
import { Plane } from "p2";
import GROUPS from "./groups"

export default class Ground extends Entity {
  constructor(dict, visual) {
    super(dict, visual)

    this.name = GROUPS.GROUND

    this.#init(dict.options)
  }

  #init({ymin}) {
    const plane = this.addBody({
      position: [0, ymin],
      // collisionGroup: GROUPS.GROUND,
      // collisionMask: GROUPS.DROP
    })
    plane.addShape(new Plane());
  }
}
