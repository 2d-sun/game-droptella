import { Entity } from "./entity"
import { Plane, Box } from "p2";
import GROUPS from "./groups"

export default class Ground extends Entity {
  constructor(dict, visual) {
    super(dict, visual)

    this.name = GROUPS.GROUND

    this.#init(dict.options)
  }

  #init({ymin, width, height}) {
    const plane = this.addBody({
      position: [0, ymin - height],
      mass: 1000,
      fixedRotation: true,
      fixedY: true,
      fixedX: true,
      gravityScale: 0,
      // collisionGroup: GROUPS.GROUND,
      // collisionMask: GROUPS.DROP
    })
    // plane.addShape(new Plane());
    plane.addShape(new Box({
      width,
      height
    }))
  }
}
