import * as PIXI from "pixi.js";
import Level from "./level";
import { Entity } from "./entities/entity";
import donates from "./labels/donates"
import missed from "./labels/missed"
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

export class Game {
  constructor(app) {
    this.app = app;

    this.deadHouses = []
    this.houses = []

    this.entities = {
      [GROUPS.DROP]: [],
      [GROUPS.UMBRELLA]: [],
      [GROUPS.GROUND]: [],
      [GROUPS.HOUSE]: this.houses
    };

    this.labels = {
      donates,
      missed,
      catched
    }

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
      .add("bg_tiled_layer1", "bg_tiled_layer1.png", options)
      .add("bg_tiled_layer2", "bg_tiled_layer2_stars.png", options)
      .add(
        "bunny",
        "https://pixijs.io/examples/examples/assets/bunny.png",
        options
      )
      .add("my-map", "my-map.json", options);

    app.loader.load(() => {
      setTimeout(async () => {
        this.app.preloader.hide();
        this.app.runners.initLevel.run(this.level);
        this.level.init(this.app);
        this.app.mouse.init()

        Object.keys(this.labels).forEach(label => {
          app.stage.addChild(this.labels[label].text)
        })
      }, 3000);

      setInterval(() => {
        // one house produces 1$ per second
        this.incrementDonates(this.houses.length - this.deadHouses.length)
      }, 1000)
    });
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
}
