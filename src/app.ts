import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsMotionType,
  DistanceConstraint,
  StandardMaterial,
  Color3,
  HavokPlugin,
  PhysicsShapeType,
  PhysicsAggregate,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { PhysicsBody } from "@babylonjs/core";

class App {
  scene: Scene;

  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    var engine = new Engine(canvas, true);
    this.scene = new Scene(engine);
    var camera: ArcRotateCamera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(canvas, true);
    var light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this.scene
    );

    this.enablePhysic().then(() => {
      const box1 = MeshBuilder.CreateBox("box", { width: 1, height: 1 }, this.scene);
      const box2 = MeshBuilder.CreateBox("box", { width: 1, height: 1 }, this.scene);
      const box3 = MeshBuilder.CreateBox("box", { width: 1, height: 1 }, this.scene);
      const box4 = MeshBuilder.CreateBox("box", { width: 1, height: 1 }, this.scene);
      var ground = MeshBuilder.CreateGround("ground",{ width: 10, height: 10 },this.scene);
      box1.position = new Vector3(0, 1, 0);
      box2.position = new Vector3(1, 1, 0);
      box3.position = new Vector3(2, 1, 0);
      box4.position = new Vector3(3, 1, 0);
      let boxMaterialLightGreen = new StandardMaterial("material", this.scene);
      boxMaterialLightGreen.emissiveColor = new Color3(0.1, 0.8, 0);
      let boxMaterialDarkGreen = new StandardMaterial("material", this.scene);
      boxMaterialDarkGreen.emissiveColor = new Color3(0.2, 0.48, 0.32);
      box1.material = boxMaterialLightGreen;
      box2.material = boxMaterialDarkGreen;
      box3.material = boxMaterialLightGreen;
      box4.material = boxMaterialDarkGreen;
    });

    engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async enablePhysic(): Promise<void> {
    const havok = await HavokPhysics();
    this.scene.enablePhysics(
      new Vector3(0, -9.81, 0),
      new HavokPlugin(true, havok)
    );
  }
}
new App();
