import * as PIXI from "pixi.js";
import Level from "./level";
import { Entity } from "./entities/entity";
import Label from "./labels/label"
import donates from "./labels/donates"
import missed from "./labels/missed"
import housesPersentage from "./labels/housesPersentage"
import Notification from "./labels/notification"
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

const FAILED_HOUSE_HUMBER_CONDITION = 26
const STAGES_TO_FULL_VICTORY = 2

export class Game {
  constructor(app) {
    this.app = app;

    this.nativeCanvas = document.getElementById("app")

    this.deadHouses = []
    this.houses = []
    this.stagesToFullVictory = STAGES_TO_FULL_VICTORY
    this.savedCity = 0
    this.lostCity  = 0

    this.textures = {}

    this.cities = new Array(10)

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
      notification: new Notification(),
      subtext: new Notification("clickToProceed")
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
      .add("bunny","https://pixijs.io/examples/examples/assets/bunny.png",options)
      .add("buildings", "./static/assets/sheet/buildings.png")

    app.loader.load(() => {
      setTimeout(() => {
        this.app.preloader.hide();
        this.loadTextures()

        Object.keys(this.labels).forEach(label => {
          app.stage.addChild(this.labels[label].text)
        })
        this.app.stage.addChild(this.tempLabels.notification.changeTo("premise", 0).chanseFontSize(0.015).text)

        this.addClickToProceedLabel()


        this.beginWithContext = this.begin.bind(this)
        this.nextStageWithContext = this.nextStage.bind(this)
        this.app.renderer.view.addEventListener("mousedown", this.beginWithContext);
        this.app.renderer.view.addEventListener("touchstart", this.beginWithContext);
      }, 1000)
    });
  }

  addClickToProceedLabel() {
    this.app.stage.addChild(this.tempLabels.subtext
      .chanseFontSize(0.01)
      //.setX(window.innerWidth/2 + this.tempLabels.notification.text.width)
      .setY(window.innerHeight/2 + this.tempLabels.notification.text.height)
      .text
    )
  }

  removeClickToProceedLabel() {
    this.app.stage.removeChild(this.tempLabels.subtext.text)
  }

  begin(e) {
    this.app.renderer.view.removeEventListener("touchstart", this.beginWithContext);
    this.app.renderer.view.removeEventListener("mousedown", this.beginWithContext);
    // hide this stuff
    this.app.stage.removeChild(this.tempLabels.notification.text)
    this.removeClickToProceedLabel()
    this.tempLabels.notification.changeTo("failed").chanseFontSize(0.04)

    // init level
    this.app.runners.initLevel.run(this.level);
    this.loadBackgrounds()
    this.level.init(this.app);
    this.level.startGenerateDrops()
    this.app.mouse.init()


    this.intervals.donatesHouses = setInterval(() => {
      // one house produces 1$ per second
      this.incrementDonates(this.houses.length - this.deadHouses.length)
    }, 1000)
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
  updateHousesPersentage() {
    this.labels.housesPersentage.update(Math.floor(100 * this.houses.length / this.level.initialHousesNumber))
  }

  removeHouse(entity) {
    this.remove(entity)
    this.deadHouses.push(entity)
  }

  checkEndLevelCondition() {
    if (
      (this.level.initialHousesNumber > FAILED_HOUSE_HUMBER_CONDITION &&  this.houses.length <= FAILED_HOUSE_HUMBER_CONDITION) ||
      (this.level.initialHousesNumber <= FAILED_HOUSE_HUMBER_CONDITION && this.houses.length <= 0)
    ) {
      this.runFailCondition()
    }
  }

  runFailCondition() {
    this.lostCity++
    this.app.stage.addChild(this.tempLabels.notification.changeTo("failed").text)
    this.level.stopGenerateDrops()
    this.addClickToProceedLabel()
    this.removeStageEntities()
    this.enableNextStageTap()
  }

  checkWinCondition() {
    this.level.stopGenerateDrops()

    this.intervals.checkWinConditionInterval = setInterval(() => {
      this.entities[GROUPS.DROP]
        .filter(({body}) => body.velocity[0] === 0 && body.velocity[1] === 0)
        .forEach(this.app.game.remove)

      if (this.entities[GROUPS.DROP].length === 0) {
        this.app.game.runWinCondition()
      }
    }, 1000)
  }

  runWinCondition() {
    this.savedCity++
    clearInterval(this.intervals.checkWinConditionInterval)
    this.app.stage.addChild(this.tempLabels.notification.changeTo("victory").text)
    this.addClickToProceedLabel()
    this.removeStageEntities()
    this.enableNextStageTap()
    this.level.upgradeUmbrella(0.5)
  }

  nextStage() {
    if (this.isNextStageLoads) {
      return
    }
    this.stagesToFullVictory--

    if (this.stagesToFullVictory === 0) {
      return this.showFullVictoryStage()
    }

    this.isNextStageLoads = true
    this.removeClickToProceedLabel()
    this.disableNextStageTap()
    this.app.level.dropsNumber = 0
    setTimeout(() => {
      this.level.addUmrella(this.app) 
    }, 1000)
    setTimeout(() => {
      if (this.isHousesLoaded) return
      this.tempLabels.notification.changeTo("start")
      this.isHousesLoaded = true
      this.app.level.initialHousesNumber = 0
      this.level.addHouses(this.app)
    }, 1000)
    setTimeout(() => {
      this.app.stage.removeChild(this.tempLabels.notification.text)
      this.level.startGenerateDrops()
    }, 1500)
  }

  showFullVictoryStage() {
    this.app.stage.addChild(this.tempLabels.notification.changeToFn("fullVictory", [this.savedCity, this.lostCity]).text)
  }

  enableNextStageTap() {
    this.isNextStageLoads = false
    this.isHousesLoaded = false
    this.app.renderer.view.addEventListener("mousedown", this.nextStageWithContext);
    this.app.renderer.view.addEventListener("touchstart", this.nextStageWithContext);
  }

  disableNextStageTap() {
    this.app.renderer.view.removeEventListener("mousedown", this.nextStageWithContext);
    this.app.renderer.view.removeEventListener("touchstart", this.nextStageWithContext);
  }

  removeStageEntities() {
    this.entities[GROUPS.DROP].forEach(this.app.game.remove)
    this.entities[GROUPS.UMBRELLA].forEach(this.app.game.remove)
    this.entities[GROUPS.HOUSE].forEach(this.app.game.remove)
  }
}
