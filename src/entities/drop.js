import { Entity } from "./entity"
import { Body, Box } from "p2";
import GROUPS from "./groups"

export default class Drop extends Entity {
  constructor(dict, visual) {
    super(dict, visual)

    this.name = GROUPS.DROP

    this.#init(dict.options)
  }

  #init({radius = 0.0002, mass = 10, position = [0,0], destroyMs}) {
    this.dict.body = new Body({
      mass,
      position,
      //gravityScale: 2
    });

    this.dict.body.addShape(new Box({
      width: radius,
      height: radius*3,
    }));

    // this.dict.body.allowSleep = true;
    // this.dict.body.sleepSpeedLimit = 1; // Body will feel sleepy if speed<1 (speed is the norm of velocity)
    // this.dict.body.sleepTimeLimit =  1;

    this.dict.body.destroyMs = destroyMs

    this.body = this.dict.body
  }
}
