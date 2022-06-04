import * as PIXI from "pixi.js";
import Level from "./level";
import { Entity } from "./entities/entity";
import Label from "./labels/label"
import donates from "./labels/donates"
import missed from "./labels/missed"
import housesPersentage from "./labels/housesPersentage"
import failed from "./labels/failed"
import catched from "./labels/catched"
import GROUPS from "./entities/groups"

const style = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 72,
  //fontStyle: "italic",
  fontWeight: "bold",
  //fill: ["#ffffff", "#00ff99"], // gradient
  fill: ["#ffffff"],
  stroke: "#4a1850",
  //strokeThickness: 5,
  dropShadow: true,
  //dropShadowColor: "#000000",
  //dropShadowBlur: 4,
  //dropShadowAngle: Math.PI / 6,
  //dropShadowDistance: 6,
  //wordWrap: true,
  //wordWrapWidth: 440
});

class MeasureY extends Label {
  constructor(y) {
    super(y)
    this.text.y = y
  }
}

class MeasureX extends Label {
  constructor(x) {
    super(x)
    this.text.y = 0
    this.text.x = x
  }
}

export class Game {
  constructor(app) {
    this.app = app;

    this.deadHouses = []
    this.houses = []

    this.textures = {}

    this.entities = {
      [GROUPS.DROP]: [],
      [GROUPS.UMBRELLA]: [],
      [GROUPS.GROUND]: [],
      [GROUPS.HOUSE]: this.houses
    };

    this.labels = {
      donates,
      missed,
      catched,
      housesPersentage
    }

    this.tempLabels = {
      failed
    }

    this.intervals = {
      donatesHouses: null
    }

    // for (let i=0; i<=4000; i+=50) {
    //   this.labels[`labelY${i}`] = new MeasureY(i)
    //   this.labels[`labelX${i}`] = new MeasureX(i)
    // }

    this.started = false;

    this.level = new Level(app)
  }

  initLevel() {
    this.started = true;
    if (this.pixiRoot) {
      this.pixiRoot.destroy({ children: true });
    }
    this.pixiRoot = new PIXI.Container();
    this.app.stage.addChildAt(this.pixiRoot, 0);
  }

  add(dict, model) {
    let entity = dict instanceof Entity ? dict : new Entity(dict, model);

    const entityGroup = entity.getName()
    if (entityGroup) {
      this.entities[entity.getName()].push(entity);
      this.app.runners.addEntity.run(entity);
    }
  }

  remove(entity) {
    entity.dead = true;
  }

  lateLoop() {
    for (let groupName of Object.keys(this.entities)) {
      let j = 0
      const entities = this.entities[groupName]
      entities.forEach(entity => {
        if (entity.dead) {
          this.app.runners.removeEntity.emit(entity);
        } else {
          entities[j++] = entity;
        }
      })
      entities.length = j; 
    }
  }

  onStartup() {
    const { app } = this;

    app.preloader.show();

    app.ticker.add(delta => {
      if (this.started) {
        app.runners.earlyLoop.run(delta);
        app.runners.loop.run(delta);
        app.runners.lateLoop.run(delta);
      }
    });

    // app.nameTitle = new PIXI.Text(``, style)
    // app.nameTitle.x = 100
    // app.nameTitle.y = 500
    // app.stage.addChild(app.nameTitle);


    const options = { crossOrigin: "*" };
    app.loader.baseUrl = "../static/assets";
    app.loader
      .add("background", "./static/assets/sheet/background.png")
      .add("bg_tiled_layer1", "bg_tiled_layer1.png", options)
      .add("bg_tiled_layer2", "bg_tiled_layer2_stars.png", options)
      .add(
        "bunny",
        "https://pixijs.io/examples/examples/assets/bunny.png",
        options
      )
      .add("buildings", "./static/assets/sheet/buildings.png")
      .add("my-map", "my-map.json", options);

    app.loader.load(() => {  
      setTimeout(async () => {
        this.app.preloader.hide();
        this.loadTextures()
        this.app.runners.initLevel.run(this.level);
        this.level.init(this.app);
        this.level.startGenerateDrops()
        this.app.mouse.init()

        Object.keys(this.labels).forEach(label => {
          app.stage.addChild(this.labels[label].text)
        })
        this.loadBackgrounds()
      }, 3000);

      this.intervals.donatesHouses = setInterval(() => {
        // one house produces 1$ per second
        this.incrementDonates(this.houses.length - this.deadHouses.length)
        this.updateHousesPersentage(this.houses.length)
      }, 1000)
    });
  }

  loadTextures() {
    const buildingsSheet = new PIXI.BaseTexture.from(app.loader.resources["buildings"].url)

    this.textures.buildingsTextures = {
      waterTower: new PIXI.Texture(buildingsSheet, new PIXI.Rectangle(60, 200, 69, 120)),
      hospital: new PIXI.Texture(buildingsSheet, new PIXI.Rectangle(125, 191, 125, 133)),
      bank: new PIXI.Texture(buildingsSheet, new PIXI.Rectangle(250, 260, 70, 60)),
      0: new PIXI.Texture(buildingsSheet, new PIXI.Rectangle(338, 212, 75, 100)),
      1: new PIXI.Texture(buildingsSheet, new PIXI.Rectangle(427, 212, 80, 100)),
      2: new PIXI.Texture(buildingsSheet, new PIXI.Rectangle(517, 212, 60, 95)),
      3: new PIXI.Texture(buildingsSheet, new PIXI.Rectangle(582, 212, 60, 95)),
    }
  }

  loadBackgrounds() {
    let tiling = new PIXI.Sprite(app.loader.resources["background"].texture, window.innerWidth, window.innerHeight);
    tiling.anchor.set(0, 0);
    tiling.position.set(-2048, -1024);
    tiling.zIndex = 0
    tiling.width = window.innerWidth
    tiling.height = window.innerHeight
    this.pixiRoot.addChild(tiling);
  }

  incrementCatched() {
    this.labels.catched.incrementAndUpdate()
  }
  incrementMissed() {
    this.labels.missed.incrementAndUpdate()
  }
  incrementDonates(income) {
    this.labels.donates.addAndUpdate(income)
  }
  updateHousesPersentage(houses) {
    // this.labels.housesPersentage.update(`${houses}/${this.level.initialHousesNumber}`)
    this.labels.housesPersentage.update(Math.floor(100 * houses / this.level.initialHousesNumber))
  }

  removeHouse(entity) {
    this.remove(entity)
    this.deadHouses.push(entity)
  }

  checkEndLevelCondition() {
    if (
      (this.level.initialHousesNumber > 3 &&  this.houses.length <= 3) ||
      (this.level.initialHousesNumber <= 3 && this.houses.length <= 0)
    ) {
      clearInterval(this.intervals.donatesHouses)
      this.level.stopGenerateDrops()
      this.app.stage.addChild(this.tempLabels.failed.text)
    }
  }
}
