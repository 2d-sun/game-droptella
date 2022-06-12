import * as PIXI from "pixi.js";
import Level from "./level";
import { Entity } from "./entities/entity";
import Label from "./labels/label"
import donates from "./labels/donates"
import missed from "./labels/missed"
import housesPersentage from "./labels/housesPersentage"
import Notification from "./labels/notification"
import SupportUkraineLabel from "./labels/supportUkraine"
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

const FAILED_HOUSE_HUMBER_CONDITION = 5
const STAGES_TO_FULL_VICTORY = 10

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

    this.audioNames = [
      "1_Court_and_PageSilent_Partner",
      "2_Drizzle_to_Downpour_Silent_Partner",
      "3_Event_Departure_Silent_Partner",
      "4_Far_The_Days_Come_Letter_Box"
    ]

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
      subtext: new Notification("clickToProceed", {dropShadow: false, fill: ['#fff']}),
      tryAgain: new Notification("tryAgain"),
      widescreenSupportAlert: new Notification("widescreenRatioSupportAlert", {
        fontSize: window.innerWidth * 0.05,
        wordWrapWidth: window.innerWidth
      })
    }

    this.supportUkraineLabels = {
      supportUkrainePrytula: new SupportUkraineLabel("supportUkrainePrytula", {x: window.innerWidth/2, topKo: 0.04}),
      supportUkraineSafeLifeInUa: new SupportUkraineLabel("supportUkraineSafeLifeInUa", {x: window.innerWidth/2, topKo: 0.07}),
      supportUkraineInfo: new SupportUkraineLabel("supportUkraineInfo", {x: window.innerWidth/2, topKo: 0.1}),
      supportUkraineStandWithUkraine: new SupportUkraineLabel("supportUkraineStandWithUkraine", {x: window.innerWidth/2, topKo: 0.14}),
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

    const options = { crossOrigin: "*" };
    // app.loader.baseUrl = "../static/assets";
    app.loader
      .add("background", "static/assets/sheet/background.jpeg")
      .add("bunny","https://pixijs.io/examples/examples/assets/bunny.png",options)
      .add("buildings", "static/assets/sheet/buildings.png")
      .add("stuff", "static/assets/sheet/stuff.png")
      //.add("song1", "./static/assets/audio/Lurking - Silent Partner.mp3")

    this.loadAudio()

    app.loader.load(() => {
      setTimeout(() => {
        this.app.preloader.hide();

        // temporary solution for horizontal aspect eratio
        if (this.app.renderer.width < this.app.renderer.height) {
          this.app.stage.addChild(this.tempLabels.widescreenSupportAlert.text)
          return
        }

        this.loadTextures()

        Object.keys(this.labels).forEach(label => {
          app.stage.addChild(this.labels[label].text)
        })

        Object.values(this.supportUkraineLabels).forEach(label => {
          this.app.stage.addChild(label.text)
        })

        this.drawSupportAttraction()

        this.app.stage.addChild(this.tempLabels.notification
          .setY(this.drawSupportAttractionY)
          .changeTo("premise", 0)
          .chanseFontSize(0.015).text)

        this.addClickToProceedLabel(this.tempLabels.notification.text.height, this.drawSupportAttractionY + this.tempLabels.notification.text.height*0.6)


        this.beginWithContext = this.begin.bind(this)
        this.nextStageWithContext = this.nextStage.bind(this)
        this.app.renderer.view.addEventListener("mousedown", this.beginWithContext);
        this.app.renderer.view.addEventListener("touchstart", this.beginWithContext);
      }, 1000)
    });
  }

  addClickToProceedLabel(height, y) {
    this.app.stage.addChild(this.tempLabels.subtext
      .chanseFontSize(0.01)
      //.setX(window.innerWidth/2 + this.tempLabels.notification.text.width)
      .setY(y || window.innerHeight/2 + height)
      .text
    )
  }

  removeClickToProceedLabel() {
    this.app.stage.removeChild(this.tempLabels.subtext.text)
  }

  begin(e) {
    if (this.isClickOnSupportAttraction(e)) {
      // ignore if mouse is above rectangle for donate attraction
      return
    }

    this.myAudioElement.play();

    this.app.renderer.view.removeEventListener("touchstart", this.beginWithContext);
    this.app.renderer.view.removeEventListener("mousedown", this.beginWithContext);


    Object.values(this.supportUkraineLabels).forEach(label => {
      this.app.stage.removeChild(label.text)
    })
    this.app.stage.removeChild(this.supportAttractionGraphics)

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

    const stuffSheet = new PIXI.BaseTexture.from(app.loader.resources["stuff"].url)

    this.textures.stuffTextures = {
      drop: new PIXI.Texture(stuffSheet, new PIXI.Rectangle(0, 0, 94, 316)),
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
  getDonates() {
    return this.labels.donates.donate
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
    this.app.stage.addChild(this.tempLabels.widescreenSupportAlert.changeTo("failed").text)
    this.level.stopGenerateDrops()
    this.addClickToProceedLabel(this.tempLabels.widescreenSupportAlert.text.height)
    this.removeStageEntities()
    this.level.increaseDropsLimit()
    this.enableNextStageTap()
  }

  checkWinCondition() {
    this.level.stopGenerateDrops()

    this.intervals.checkWinConditionInterval = setInterval(() => {
      this.entities[GROUPS.DROP]
        .filter(({body}) => body.velocity[0] === 0 && body.velocity[1] === 0)
        .forEach(this.app.game.remove)

      if (this.entities[GROUPS.DROP].length === 0) {
        this.runWinCondition()
      }
    }, 1000)
  }

  runWinCondition() {
    const savedHouses = this.houses.length
    const lostHouses  = this.level.initialHousesNumber - this.houses.length
    this.savedCity++
    this.level.dropDropsLimit()
    clearInterval(this.intervals.checkWinConditionInterval)
    this.app.stage.addChild(this.tempLabels.notification.changeToFn("victory", [savedHouses, lostHouses]).text)
    this.addClickToProceedLabel(this.tempLabels.notification.text.height)
    this.removeStageEntities()
    this.enableNextStageTap()
    this.level.upgradeUmbrella(0.5)
  }

  nextStage() {
    if (this.isNextStageLoads) {
      return
    }
    this.stagesToFullVictory--
    this.isNextStageLoads = true
    this.removeClickToProceedLabel()
    this.disableNextStageTap()

    if (this.stagesToFullVictory === 0) {
      return this.showFullVictoryStage()
    }

    this.app.level.dropsNumber = 0
    setTimeout(() => {
      this.level.addUmrella(this.app) 
    }, 1000)
    setTimeout(() => {
      if (this.isHousesLoaded) return
      this.app.stage.removeChild(this.tempLabels.widescreenSupportAlert.text)
      this.app.stage.addChild(this.tempLabels.notification.changeTo("start").text)
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
    this.app.stage.removeChild(this.tempLabels.notification.text)
    this.app.stage.addChild(this.tempLabels.widescreenSupportAlert.changeToFn("fullVictory", [this.savedCity, this.lostCity]).text)
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

  getSupportCoords() {

  }

  drawSupportAttraction() {
    const lastLabel = this.supportUkraineLabels.supportUkraineStandWithUkraine
    const labelsValues = Object.values(this.supportUkraineLabels)

    let width  = Math.max(...labelsValues.map(({text})=> text.width)) * 1.1

    const height = lastLabel.text.y + lastLabel.text.height - this.supportUkraineLabels.supportUkrainePrytula.text.y/2

    const x    = window.innerWidth/2 - width/2
    let y      = Math.min(...labelsValues.map(({text})=> text.y))


    const graphics = new PIXI.Graphics();

    graphics.lineStyle(window.innerWidth*0.005, 0xFEEB77, 1);
    graphics.drawRect(x, y - y*0.4, width, height);
    graphics.endFill();

    graphics.beginFill(0x1305b7);
    graphics.lineStyle(window.innerWidth*0.005, 0x1305b7, 1);
    graphics.moveTo(x - window.innerWidth*0.003, y * 0.45);
    graphics.lineTo((window.innerWidth/2 + width/2) + window.innerWidth*0.002, y * 0.45);
    graphics.closePath();
    graphics.endFill();

    this.app.stage.addChild(graphics)

    this.drawSupportAttractionY = (
      lastLabel.text.y +
      lastLabel.text.height +
      this.supportUkraineLabels.supportUkrainePrytula.text.y) *
      1.05

    this.supportAtractionCoors = {
      x: {
        min: x,
        max: window.innerWidth/2 + width/2
      },
      y: {
        min: y - y*0.4,
        max: (lastLabel.text.y +
          lastLabel.text.height +
          this.supportUkraineLabels.supportUkrainePrytula.text.y)
      }
    }

    this.supportAttractionGraphics = graphics
  }

  isClickOnSupportAttraction(e) {
    const {y, x} = this.supportAtractionCoors
    return x.min < e.clientX && e.clientX < x.max && y.min < e.clientY && e.clientY < y.max
  }

  loadAudio(index = 0) {
    // const myAudioElement = new Audio("static/assets/audio/Lurking_Silent_Partner.mp3");
    this.myAudioElement = new Audio(`static/assets/audio/${this.audioNames[index]}.mp3`);


    this.myAudioElement.addEventListener('ended', (event) => {
      this.loadAudio(this.getNextIndex(index))
      this.myAudioElement.play()
    });
  }

  getNextIndex(index) {
    return index % this.audioNames.length
  }
}
