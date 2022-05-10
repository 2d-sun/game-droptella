import * as p2 from "p2";
import Drop from "./entities/drop";
import Ground from "./entities/ground";
import Umbrella from "./entities/umbrella";

export class MouseController {
  constructor(app) {
    this.app = app;
    this.state = 1;
    this.mouseConstraint = null;
    this.mousePosition = p2.vec2.create();
    this.world = null;
    this.nullBody = null;
    this.umbrella = null;
  }

  init() {
    const { pixiRoot } = this.app.game;
    const { phys } = this.app;
    this.world = phys.world;
    this.nullBody = new p2.Body();
    this.umbrella = this.world.bodies.find(body => body.entity instanceof Umbrella)

    pixiRoot.interactive = true;
    
    pixiRoot.on("pointermove", e => {
      const point = pixiRoot.toLocal(e.data.global);
      point.x = -point.x * phys.PIXEL_TO_METER;
      point.y = -point.y * phys.PIXEL_TO_METER;

      this.handleMouseMove([point.x, point.y]);
    });

    this.world.on("beginContact", (evt) => {
      // unmrella has collision with drop
      if (evt.bodyA.entity instanceof Umbrella && evt.bodyB.entity instanceof Drop) {
        this._catchDrop(evt.bodyB.entity)
      } else if (evt.bodyB.entity instanceof Umbrella  && evt.bodyA.entity instanceof Drop) {
        this._catchDrop(evt.bodyA.entity)
      } else if (evt.bodyA.entity instanceof Ground && evt.bodyB.entity instanceof Drop) {
        this._missDrop(evt.bodyB.entity)
      } else if (evt.bodyB.entity instanceof Ground && evt.bodyA.entity instanceof Drop) {
        this._missDrop(evt.bodyA.entity)
      }
    })

    this.mouseConstraint = null;
    this.state = MouseController.DEFAULT;
  }

  _catchDrop(entity) {
    this.app.game.incrementCatched()
    this.app.game.remove(entity)
  }

  _missDrop(entity) {
    if (!entity.missed) {
      entity.missed = true
      this.app.game.incrementMissed()
    }
  }

  setState(state) {
    this.state = state;
  }

  handleMouseMove(physicsPosition) {
    // console.log("move", this.umbrella)
    // const b = this.umbrella
    // b.wakeUp()
    // const localPoint = p2.vec2.create();
    // b.toLocalFrame(localPoint, physicsPosition);
    // this.world.addBody(this.nullBody);
    // this.mouseConstraint = new p2.RevoluteConstraint(this.nullBody, b, {
    //   localPivotA: physicsPosition,
    //   localPivotB: localPoint,
    //   maxForce: 1000 * b.mass
    // });
    // this.world.addConstraint(this.mouseConstraint);

    // p2.vec2.copy(this.mouseConstraint.pivotA, physicsPosition);
    // this.mouseConstraint.bodyA.wakeUp();
    // this.mouseConstraint.bodyB.wakeUp()
    this.umbrella.position[0] = physicsPosition[0]
    //this.umbrella.velocity[0] = Math.ceil(physicsPosition[0] - this.umbrella.position[0]) * 3
  }
}

MouseController.DEFAULT = 1;
MouseController.PANNING = 2;
MouseController.DRAGGING = 3;
