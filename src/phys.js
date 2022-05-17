import * as PIXI from "pixi.js";
import { Circle, Convex, Plane, World } from "p2";
import GROUPS from "./entities/groups"

export class Phys {
  constructor(app) {
    this.app = app;
    this.setScale(30);
    this.world = null;
  }

  setScale(meterPerPixel) {
    this.METER_TO_PIXEL = meterPerPixel;
    this.PIXEL_TO_METER = 1 / meterPerPixel;
  }

  initLevel(lvl) {
    this.setScale(lvl.data.scale || 30);

    this.world = new World({ gravity: [0, lvl.data.gravity || -1] });
  }

  loop(delta) {
    const fixedTimeStep = 1 / 60; // seconds
    const maxSubSteps = 10; // Max sub steps to catch up with the wall clock

    // Make sure the time delta is not too big (can happen if user switches browser tab)
    //delta = Math.min(1 / 10, delta);
    this.world.step(fixedTimeStep, delta / 60, maxSubSteps);

    Object.keys(this.app.game.entities).forEach(groupName => {
      this.app.game.entities[groupName].forEach(entity => {
        if (entity.body) {
          this.syncBody(entity);
          this.syncVel(entity);
        }
      })
    })
  }

  addEntity(entity) {
    if (!entity.body) return;

    this.world.addBody(entity.body);
    entity.body.entity = entity;

    const stage = this.app.game.pixiRoot;

    entity.pixiDebug = this.initDebugPixi(entity);
    stage.addChild(entity.pixiDebug);
  }

  removeEntity(entity) {
    if (entity.body) {
      this.world.removeBody(entity.body);
      const stage = this.app.game.pixiRoot;
      stage.removeChild(entity.pixiDebug)
    }
  }

  syncVel(entity) {
    const { pixi, body } = entity;
    if (pixi && pixi.shader && pixi.shader.uniforms.velocity) {
      const vel = pixi.shader.uniforms.velocity;
      vel[0] = body.velocity[0];
      vel[1] = body.velocity[1];
    }
  }

  syncBody(entity) {
    let { body, pixi, pixiDebug } = entity;

    const { METER_TO_PIXEL } = this;

    if (!pixi) {
      pixi = pixiDebug;
      pixiDebug = null;
    }

    if (!pixi) {
      return;
    }
    if (body.type === 1) {
      pixi.position.set(
        -body.interpolatedPosition[0] * METER_TO_PIXEL,
        -body.interpolatedPosition[1] * METER_TO_PIXEL
      );
      pixi.rotation = body.interpolatedAngle;
    } else {
      pixi.position.set(
        -body.position[0] * METER_TO_PIXEL,
        -body.position[1] * METER_TO_PIXEL
      );
      pixi.rotation = body.angle;
    }

    if (pixiDebug) {
      pixiDebug.position.copyFrom(pixi.position);
      pixiDebug.rotation = pixi.rotation;
    }
    pixi.visible = true
  }

  initDebugPixi(entity) {
    const body = entity.body
    const { shapes } = body;
    const groupType = entity.getName()

    const debug = (this.debug = new PIXI.Graphics());
    if (groupType === GROUPS.DROP) {
      shapes.forEach(shape => this._drawDrop(debug, shape, body))
    } else if (groupType === GROUPS.UMBRELLA) {
      shapes.forEach(shape => this._drawConvex(debug, shape, body))
    // } else if (groupType === GROUPS.GROUND) {
    //   shapes.forEach(shape => this._drawPlane(debug, shape, body))
    } else {
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape instanceof Circle) {
          this._drawCircle(debug, shape, body)
        } else if (shape instanceof Plane) {
          this._drawPlane(debug, shape, body)
        } else if (shape instanceof Convex) {
          this._drawConvex(debug, shape, body)
        } 
      }
    }
    debug.body = this;
    debug.visible = false
    return debug;
  }

  _drawDrop(debug, shape, body) {
    this._drawCircle(debug, shape)
    // setTimeout(() => {
    //   this.drawStar(debug)
    // }, body.destroyMs - (body.destroyMs * 0.01))
  }

  _drawCircle(debug, shape) {
    const color = 0.774280154389259 * 0xffffff // almost red
    debug.lineStyle(3.0, color);
    //debug.beginFill(color, 1.0);
    debug.drawCircle(
      -shape.position[0] * this.METER_TO_PIXEL,
      -shape.position[1] * this.METER_TO_PIXEL,
      shape.radius * this.METER_TO_PIXEL
    );
    //debug.endFill();
    debug.lineStyle(0.0);
  }

  // works bad ... replace with box
  _drawPlane(debug, shape, body) {
    debug.lineStyle(10.0, body.color || 0x808080, 1.0);
    debug.moveTo(-2220, 0);
    debug.lineTo(this.app.renderer.width - 10, 0);
  }

  _drawConvex(debug, shape, body) {
    const color = body.color || (Math.random() * 0xffffff) | 0;
    const pos = shape.position;
    const vertices = shape.vertices;

    debug.lineStyle(3.0, color, 1.0);
    //debug.beginFill(color, 1.0);
    debug.moveTo(
      -(vertices[0][0] + pos[0]) * this.METER_TO_PIXEL,
      -(vertices[0][1] + pos[1]) * this.METER_TO_PIXEL
    );
    let n = vertices.length;
    for (let i = 1; i < n; i++) {
      debug.lineTo(
        -(vertices[i][0] + pos[0]) * this.METER_TO_PIXEL,
        -(vertices[i][1] + pos[1]) * this.METER_TO_PIXEL
      );
    }
    debug.closePath();
    //debug.endFill();

    debug.lineStyle(2.0, color, 1.0);
    // lets add normals!
    const normals = shape.normals || {};

    for (let i = 0; i < n; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % n];
      const n1 = normals[i] || [0, 0];

      debug.moveTo(
        (-(p1[0] + p2[0]) / 2) * this.METER_TO_PIXEL,
        (-(p1[1] + p2[1]) / 2) * this.METER_TO_PIXEL
      );
      debug.lineTo(
        -((p1[0] + p2[0]) / 2 + n1[0] * 0.5) * this.METER_TO_PIXEL,
        -((p1[1] + p2[1]) / 2 + n1[1] * 0.5) * this.METER_TO_PIXEL
      );
    }

    debug.lineStyle(0.0);
  }

  drawStar(debug) {
    drawStar(0, 0, 12, 30, 10, debug)
  }
}



function drawStar(cx, cy, spikes, outerRadius, innerRadius, ctx) {
  var rot = Math.PI / 2 * 3;
  var x = cx;
  var y = cy;
  var step = Math.PI / spikes;

  ctx.lineStyle(2, 0xFFFFFF);
  ctx.moveTo(0, 0)
  for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y)
      rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath();
}