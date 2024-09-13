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
  PointerDragBehavior,
  SixDofDragBehavior,
  PhysicsPrestepType,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { PhysicsBody } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';

class App {
  scene: Scene; 
  constructor() {
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
    Inspector.Show(this.scene, {});
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
      var ground = MeshBuilder.CreateGround(
        "ground",
        { width: 30, height: 20 },
        this.scene
      );
      box1.metadata = {
        id: 1,
      };
      box2.metadata = {
        id: 2,
      };
      box3.metadata = {
        id: 3,
      };
      box4.metadata = {
        id: 4,
      };

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

      const box1Body = createPhysicBox(box1, this.scene);
      const box2Body = createPhysicBox(box2, this.scene);
      const box3Body = createPhysicBox(box3, this.scene);
      const box4Body = createPhysicBox(box4, this.scene);
      
      const constraint = new DistanceConstraint(
        1.15, // max distance between the two bodies
        this.scene
      );

      box1Body.addConstraint(box2Body, constraint);
      box2Body.addConstraint(box3Body, constraint);
      box3Body.addConstraint(box4Body, constraint);


      var groundShape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(20, 1, 20),
        this.scene
      );
      var pointerDragBehavior = new PointerDragBehavior({
        dragAxis: new Vector3(1, 0, 0),
      });
      
      pointerDragBehavior.useObjectOrientationForDragging = false;
      
      pointerDragBehavior.onDragStartObservable.add((event) => {
        console.log("dragStart");
        console.log(event);
      });
      pointerDragBehavior.onDragObservable.add((event) => {
        console.log("drag");
        console.log(event);
      });
      pointerDragBehavior.onDragEndObservable.add((event) => {
        console.log("dragEnd");
        console.log(event);
      });
      box4Body.setPrestepType(PhysicsPrestepType.ACTION)
      box4.addBehavior(pointerDragBehavior);
   
      worldBuild(ground, groundShape, this.scene);
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
const createPhysicBox = function (box, scene){
  const boxBody = new PhysicsBody(
    box,
    PhysicsMotionType.DYNAMIC,
    false,
    scene
  );
  var boxShape = new PhysicsShapeBox(
    new Vector3(0, 0, 0),
    Quaternion.Identity(),
    new Vector3(1, 1, 0),
    scene
  );
  var boxMaterial = { friction: 0.5, restitution: 0.5 };
  boxBody.setMassProperties({
    mass: 1,
    centerOfMass: new Vector3(1, 0, 0),
    inertia: new Vector3(1, 1, 1),
    inertiaOrientation: new Quaternion(0, 0, 0, 1),
  });
  boxShape.material = boxMaterial;
  boxBody.shape = boxShape;
  return boxBody;
}
const worldBuild = function (ground, groundShape, scene) {
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
