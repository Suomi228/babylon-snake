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
  Quaternion,
  PhysicsShapeBox,
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
    camera.setPosition(new Vector3(0, 1, 10));
    camera.attachControl(canvas, true);
    var light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this.scene
    );

    this.enablePhysic().then(() => {
      const box1 = MeshBuilder.CreateBox(
        "box",
        { width: 1, height: 1 },
        this.scene
      );
      const box2 = MeshBuilder.CreateBox(
        "box",
        { width: 1, height: 1 },
        this.scene
      );
      const box3 = MeshBuilder.CreateBox(
        "box",
        { width: 1, height: 1 },
        this.scene
      );
      const box4 = MeshBuilder.CreateBox(
        "box",
        { width: 1, height: 1 },
        this.scene
      );
      box1.metadata = {
        id: 1
      }
      box2.metadata = {
        id: 2
      }
      box3.metadata = {
        id: 3
      }
      box4.metadata = {
        id: 4
      }
      
      box1.position = new Vector3(0, 1, 0);
      box2.position = new Vector3(1, 2, 0);
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
      const box1Body = new PhysicsBody(
        box1,
        PhysicsMotionType.STATIC,
        false,
        this.scene
      );
      box1Body.setMassProperties({
        mass: 1,
        centerOfMass: new Vector3(0, 1, 0),
        inertia: new Vector3(1, 1, 1),
        inertiaOrientation: new Quaternion(0, 0, 0, 1),
      });
      const box2Body = new PhysicsBody(
        box2,
        PhysicsMotionType.DYNAMIC,
        false,
        this.scene
      );
      box2Body.setMassProperties({
        mass: 1,
        centerOfMass: new Vector3(1, 0, 0),
        inertia: new Vector3(1, 1, 1),
        inertiaOrientation: new Quaternion(0, 0, 0, 1),
      });
      const box3Body = new PhysicsBody(
        box3,
        PhysicsMotionType.DYNAMIC,
        false,
        this.scene
      );
      const box4Body = new PhysicsBody(
        box4,
        PhysicsMotionType.DYNAMIC,
        false,
        this.scene
      );
      const constraint = new DistanceConstraint(
        1, // max distance between the two bodies
        this.scene
      );

      box1Body.addConstraint(box2Body, constraint);
      box2Body.addConstraint(box3Body, constraint);
      box3Body.addConstraint(box4Body, constraint);
      var ground = MeshBuilder.CreateGround(
        "ground",
        { width: 10, height: 10 },
        this.scene
      );
      var groundShape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(1, 0.1, 1),
        this.scene
      );
      WorldBuild(ground, groundShape, this.scene);
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

const WorldBuild = function (ground, groundShape, scene) {
  var groundBody = new PhysicsBody(
    ground,
    PhysicsMotionType.STATIC,
    false,
    scene
  );
  var groundMaterial = { friction: 1, restitution: 1 };

  groundShape.material = groundMaterial;
  groundBody.shape = groundShape;
  groundBody.setMassProperties({
    centerOfMass: new Vector3(0, 0, 0),
    mass: 1,
    inertia: new Vector3(1, 1, 1),
    inertiaOrientation: Quaternion.Identity(),
  });

  ground.metadata = {
    shape: groundShape,
  };
};
