import * as p2 from "p2";
import Drop from "./entities/drop";
import Umbrella from "./entities/umbrella";
import Ground from "./entities/ground";
import House from "./entities/house";

function getRandomInt(min, max) {
  return Math.random() * (max - min) + min
}

const DROPS_LIMIT = 100

export default class LevelDrops {
  constructor(app) {
    this.app = app
    this.data = {
      scale: 0,
      gravity: -(window.innerHeight * 0.02435)
    }
    this.bgPosition = { x: 0, y: 0 };
    this.warp = false;

    this.topKo = 0.05

    this.dropsNumber = 0
    this.dropsLimit  = DROPS_LIMIT // aproximatlry, 300 seconds

    let 
      xmin = this._getXMin(),
      xmax = this._getXMax(),
      ymin = this._getYMin(),
      ymax = this._getYMax();
    // let 
    //   xmin = 7,
    //   xmax = -14,
    //   ymin = -4,
    //   ymax = 4;
    this.options = {
      xmax, xmin, ymax, ymin,
      width: app.renderer.width,
      height: app.renderer.height,
      scale: 350
    }

    window.levelOptions = this.options

    this.initialHousesNumber = 0
    this.umbrellaWidthLevel = 0

    window.addEventListener("resize", () => {
      requestAnimationFrame(() => {
        this.options.ymin = this._getYMin()
      })
    })
  }

  setDropsLimit(dropsLimit) {
    this.dropsLimit = dropsLimit
  }

  getDropsLimit() {
    return this.dropsLimit
  }

  _getYMin() {

    const tenPersentUp    = window.innerHeight * 0.9
    const pixelsUnit      = 300
    const physUnit        = 10
    const pixelToPhysZero = 1000
    // ((1000 - (window.innerHeight - (window.innerHeight * 0.1))) / 300) * 10
    return ((pixelToPhysZero - window.innerHeight) / pixelsUnit * physUnit) + 1
    return (pixelToPhysZero - tenPersentUp) / pixelsUnit * physUnit
    return (pixelToPhysZero - window.innerHeight)/33
  }

  _getYMax() {


    // phys - pixesl
    // -58  - 3184
    // 0    - x
    // 8.67 - 796

    // phys - pixesl
    //  30 - 100
    //  20 - 400
    //  10 - 700
    //   3 - 
    //   2 - 964
    //   1 - 997
    //   0 - 1000
    // -10 - 1300
    // -20 - 1600
    // -40 - 2200
    // -50 - 2500
    // -70 - 3127

    // 1 - 0.0333

    // 1000px - means zero in phys coords
    // 300px  - means 10 in phys coords

    const tenPersentUp    = window.innerHeight * 0.1
    const pixelsUnit      = 300
    const physUnit        = 10
    const pixelToPhysZero = 1000
    return ((pixelToPhysZero - tenPersentUp) / pixelsUnit) * physUnit
  }

  _getXMax() {
    const fivePersentUp    = window.innerWidth * 0.05
    const pixelsUnit      = 300
    const physUnit        = 10
    const pixelToPhysZero = 2000
    // ((2000 - (window.innerWidth - (window.innerWidth * 0.1))) / 300) * 10
    return ((pixelToPhysZero - (window.innerWidth - fivePersentUp)) / pixelsUnit) * physUnit
  }

  _getXMin() {
    const fivePersentUp    = window.innerWidth * 0.05
    const pixelToPhysZero = 2000
    const physUnit        = 10
    const pixelsUnit      = 300
    return ((pixelToPhysZero - fivePersentUp) / pixelsUnit) * physUnit
  }

  init(app) {
    const {world} = app.phys
    
    app.game.pixiRoot.sortableChildren = true
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

    this.addUmrella(app)

    this._addGround(app)

    this.addHouses(app)
  }

  addHouses({game}) {
    let x = this.options.xmax
    let butch = 5

    let houseWidth = window.innerWidth/1000
    
    while (x <= this.options.xmin) {
      let yardSpace = this.initialHousesNumber % butch === 0 ? getRandomInt(0.01, 0.05) : 0.1 
      
      const height = this._getHouseHeight()
      const options = {
        mass: 5000,
        position: [x, this.options.ymin + height],
        width: houseWidth,
        height
      }

      x += houseWidth + yardSpace
      game.add(new House({options}))
      this.initialHousesNumber++
    }
  }

  _addGround(app) {
    const {game} = app

    //const {ymin, ymax, xmin, xmax} = this.options

    const width  = app.renderer.width
    let height = (app.renderer.height/1000) * 2

    if (height < 1) height = 1
    
    // Create bottom plane
    game.add(new Ground({options: {
      ...this.options,
      // position: [this.options.xmin, this.options.ymin + 0.15],
      width,
      height
    }}));
    

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

  async _addDrop({ game }, options = {}) {
    function getRandomIntWithStep(min, max, step) {
      let num = Math.floor(Math.random()*(max/step));
      return num * step + min;
    }

    // options.radius = (this.options.houseWidth)/window.devicePixelRatio
    options.radius = (window.innerWidth/10000)*1.5

    for(;;) {
      let spawnMs = Math.random() < 0.2 ? 500 : 1000
      await new Promise(resolve => setTimeout(resolve, spawnMs));
      if (!this.generateGrops) continue

      options.destroyMs = Math.random() <= 0.1 ? getRandomIntWithStep(1000, 1500, 100) : getRandomIntWithStep(1500, 6000, 1000)
      options.position = [getRandomInt(this.options.xmin, this.options.xmax), this.options.ymax]

      const drop = new Drop({options})
      game.add(drop);
      this.dropsNumber++

      if (this.getDropsLimit() <= this.dropsNumber) {
        this.app.game.checkWinCondition()
      }
    }
  }

  addUmrella({game}) {
    const umbrella = new Umbrella({options: {
      ...this.options,
      widthInc: this.umbrellaWidthLevel,
      houseHeight: this._getMaxHouseHeight()
    }})
    this.app.mouse.setUmbrella(umbrella.body)
    game.add(umbrella)
  }

  upgradeUmbrella(improvementPoint) {
    this.umbrellaWidthLevel += improvementPoint
  }

  _getMaxHouseHeight() {
    return this.options.height/this.options.scale
  }

  _getHouseHeight() {
    const max = this._getMaxHouseHeight()
    const min = this.options.height/2/this.options.scale
    return getRandomInt(min, max)
  }

  startGenerateDrops() {
    this.generateGrops = true
  }

  stopGenerateDrops() {
    this.generateGrops = false
  }
}