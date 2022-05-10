import { Body } from "p2";

export class Entity {
  constructor(dict, visual) {
    this.dict = dict || {};
    this.visual = visual || {};
    this.name = "Entity"

    this.pixi = null; // Container
    this.body = null;
    this.pixiDebug = null;

    this.dead = false;

    if (this.dict.body) {
      if (this.dict.body instanceof Body) {
        this.body = dict.body;
      } else {
        this.body = new Body(dict.body);
      }
    }
  }

  addBody(options) {
    this.dict.body = new Body(options);
    this.body = this.dict.body
    return this.dict.body
  }

  getName() {
    return this.name
  }
}