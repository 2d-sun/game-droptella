import * as PIXI from "pixi.js";
import { Preloader } from "./preloader";
import { Game } from "./game";
import { Background } from "./background";
import { Phys } from "./phys";
import { MouseController } from "./mouse";
//import { Visual } from "./visual";

// https://codesandbox.io/s/fie1l?file=/src/levels/circles.js source

export class App {
  constructor() {
    this.application = new PIXI.Application({
      resizeTo: window,
      resolution: 1,
      autoResize: true,
      // resolution: devicePixelRatio
      // width: 1280,
      // height: 720,
    })

    this.renderer = this.application.renderer;
    this.ticker = this.application.ticker;
    this.stage = this.application.stage;
    this.loader = this.application.loader;

    this.ticker.add(this.render.bind(this), PIXI.UPDATE_PRIORITY.LOW);
    this.ticker.start();

    this.runners = {
      onStartup: new PIXI.Runner("onStartup"),
      initLevel: new PIXI.Runner("initLevel"),
      addEntity: new PIXI.Runner("addEntity"),
      removeEntity: new PIXI.Runner("removeEntity"),
      earlyLoop: new PIXI.Runner("earlyLoop"),
      loop: new PIXI.Runner("loop"),
      lateLoop: new PIXI.Runner("lateLoop")
    };

    this.addSystem("preloader", new Preloader(this));
    this.addSystem("game", new Game(this));
    this.addSystem("background", new Background(this));
    // this.addSystem("visual", new Visual(this));
    this.addSystem("phys", new Phys(this));
    this.addSystem("mouse", new MouseController(this));
  }

  // EXAMPLE if we run this.addSystem("game", new Game(this))
  // this.game = new Game(this)
  // this.runners.onStartup.add(this.game)
  addSystem(name, inst) {
    this[name] = inst;
    for (let key in this.runners) {
      const runner = this.runners[key];
      runner.add(inst);
    }
  }

  render() {
    this.renderer.render(this.stage);
  }

  get view() {
    return this.renderer.view;
  }

  get screen() {
    return this.renderer.screen;
  }

  get pixiRoot() {
    return this.game.pixiRoot;
  }

  get level() {
    return this.game.level;
  }

  destroy() {
    this.renderer.destroy();
    this.ticker.stop();
  }
}
