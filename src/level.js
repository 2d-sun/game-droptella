import * as p2 from "p2";
import Drop from "./entities/drop";
import Umbrella from "./entities/umbrella";
import Ground from "./entities/ground";
import House from "./entities/house";

function getRandomInt(min, max) {
  return Math.random() * (max - min) + min
}

export default class LevelDrops {
  constructor(app) {
    this.app = app
    this.data = {
      scale: 250,
      gravity: -5
    }
    this.bgPosition = { x: 0, y: 0 };
    this.warp = false;

    let 
      xmin = 7,
      xmax = -14,
      ymin = -4,
      ymax = 4;
    this.options = {
      xmax, xmin, ymax, ymin
    }
  }

  init(app) {
    const {world} = app.phys
    
    //app.renderer.resize(window.innerWidth, window.innerHeight)
    app.game.pixiRoot.position.set(2048, 1024);
    world.overlapKeeper.recordPool.resize(16);
    world.narrowphase.contactEquationPool.resize(1024);
    world.narrowphase.frictionEquationPool.resize(1024);
    world.setGlobalStiffness(1e8);
    // Max number of solver iterations to do
    world.solver.iterations = 20;
    // Solver error tolerance
    world.solver.tolerance = 0.02;
    // Enables sleeping of bodies
    world.sleepMode = p2.World.BODY_SLEEPING;

    this._addDrop(app)

    this._addUmrella(app)

    this._addGround(app)

    this._addHouses(app)
  }

  _addHouses({game}) {
    const width = Math.abs(this.options.xmax) + Math.abs(this.options.xmin)
    const numberOfHouses = 50


    let x = this.options.xmax
    let butch = 5

    let houseWidth  = width / numberOfHouses / 1.5
    let housesSpace = houseWidth * 50
    let spaceLeft   = width - housesSpace

    for (let i=0; i<numberOfHouses; i++) {
      //                                        //  4
      //
      //
      //
      //  7   3.5   0   3.5   7   10.5   14     //
      //  |-------------------------------|     // -4
      // left          center           right   //
      //
      // i=1, X = 14, nextX = 14 - 0.3(width) - 0.1(yard)
      //
      const options = {
        position: [x, this.options.ymin + 0.15],
        width: houseWidth
      }

      const housesLeft = numberOfHouses - i
      const yardSpace = i % butch === 0 ? spaceLeft / (housesLeft) : getRandomInt(0.01, spaceLeft / (housesLeft))
      spaceLeft = spaceLeft - yardSpace
      x = x + houseWidth + yardSpace
      game.add(new House({options}))
    }
  }

  _addGround(app) {
    const {game} = app

    const {ymin, ymax, xmin, xmax} = this.options
    
    // Create bottom plane
    game.add(new Ground({options: this.options}));
    

    // Create top plane
    // var planeTop = new p2.Body({
    //   position: [0, ymax],
    //   color: 0xffffff
    // });
    // planeTop.addShape(new p2.Plane());
    // game.add({ body: planeTop });

    //Left plane
    // var planeLeft = new p2.Body({
    //   //angle: -Math.PI / 2,
    //   position: [xmin, 0],
    //   mass: 0
    // });
    // planeLeft.color = 0x2596be
    // planeLeft.addShape(new p2.Box({
    //   width: 10,
    //   height: 1000
    // }));
    // game.add({ body: planeLeft });

    // Right plane
    // var planeRight = new p2.Body({
    //   angle: Math.PI / 2,
    //   position: [xmax, 0]
    // });
    // planeRight.addShape(new p2.Plane());
    // game.add({ body: planeRight });
  }

  async _addDrop({ game }, options = {position: [0,2], mass: 1, radius: 0.05}) {
    function getRandomIntWithStep(min, max, step) {
      let num = Math.floor(Math.random()*(max/step));
      return num * step + min;
    }

    for(;;) {
      let spawnMs = Math.random() < 0.2 ? 500 : 1000
      let destroyMs = Math.random() <= 0.1 ? getRandomIntWithStep(500, 1000, 100) : getRandomIntWithStep(1500, 6000, 1000)
      options.position = [getRandomInt(this.options.xmin, this.options.xmax), getRandomInt(2, 6)]
      options.destroyMs = destroyMs
      await new Promise(resolve => setTimeout(resolve, spawnMs));
      const drop = new Drop({options})
      game.add(drop);
      setTimeout(() => {
        game.remove(drop)
      }, options.destroyMs)
    }
  }

  _addUmrella({game}) {
    game.add(new Umbrella({options: this.options}))
  }
}