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
  PointerEventTypes,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { PhysicsBody } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import * as GUI from "@babylonjs/gui";

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
      //Создание мешей боксов, придача им цвета и расположения
      const box1 = createBox(1, this.scene, "green", 0,1);
      const box2 = createBox(2, this.scene, "lightGreen",1,1);
      const box3 = createBox(3, this.scene, "green",2,1);
      const box4 = createBox(4, this.scene, "lightGreen",3,1);

      //Создание земли и её физической формы
      var ground = MeshBuilder.CreateGround(
        "ground",
        { width: 30, height: 20 },
        this.scene
      );
      var groundShape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(20, 1, 20),
        this.scene
      );
      worldBuild(ground, groundShape, this.scene);

      //Цвета для боксов при клике
      let boxPickedRed = new StandardMaterial("material", this.scene);
      boxPickedRed.emissiveColor = new Color3(1, 0, 0);
      let boxPickedDarkBlue = new StandardMaterial("material", this.scene);
      boxPickedDarkBlue.emissiveColor = new Color3(0, 0, 1);

      //Установка физической формы для боксов и установка констрейнтов
      const box1Body = createPhysicBox(box1, this.scene);
      const box2Body = createPhysicBox(box2, this.scene);
      const box3Body = createPhysicBox(box3, this.scene);
      const box4Body = createPhysicBox(box4, this.scene);

      const constraint = new DistanceConstraint(
        1.15, 
        this.scene
      );

      box1Body.addConstraint(box2Body, constraint);
      box2Body.addConstraint(box3Body, constraint);
      box3Body.addConstraint(box4Body, constraint);

     //pointerDragBehavior

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

      let clickedBox;
      let boxId;

      //Установка поведения при клике на блок 
      this.scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.pickInfo.pickedMesh) {
          case box4:
            removeBoxPrestepAndBehavior(
              box2Body,
              box2,
              box3Body,
              box3,
              box1Body,
              box1,
              pointerDragBehavior
            );
            addBoxPrestepAndBehavior(box4Body, box4, pointerDragBehavior);
            clickedBox = pointerInfo.pickInfo.pickedMesh;
            boxId = clickedBox.metadata.id;
            textblock.text = `${boxId}`;
            console.log("clikced", pointerInfo.pickInfo.pickedMesh);
            break;
          case box3:
            removeBoxPrestepAndBehavior(
              box4Body,
              box4,
              box2Body,
              box2,
              box1Body,
              box1,
              pointerDragBehavior
            );
            addBoxPrestepAndBehavior(box3Body, box3, pointerDragBehavior);
            clickedBox = pointerInfo.pickInfo.pickedMesh;
            boxId = clickedBox.metadata.id;
            textblock.text = `${boxId}`;
            console.log("clikced", pointerInfo.pickInfo.pickedMesh);
            break;
          case box2:
            removeBoxPrestepAndBehavior(
              box4Body,
              box4,
              box3Body,
              box3,
              box1Body,
              box1,
              pointerDragBehavior
            );
            addBoxPrestepAndBehavior(box2Body, box2, pointerDragBehavior);
            clickedBox = pointerInfo.pickInfo.pickedMesh;
            boxId = clickedBox.metadata.id;
            textblock.text = `${boxId}`;
            console.log("clikced", pointerInfo.pickInfo.pickedMesh);
            break;
          case box1:
            removeBoxPrestepAndBehavior(
              box4Body,
              box4,
              box3Body,
              box3,
              box2Body,
              box2,
              pointerDragBehavior
            );
            addBoxPrestepAndBehavior(box1Body, box1, pointerDragBehavior);
            clickedBox = pointerInfo.pickInfo.pickedMesh;
            boxId = clickedBox.metadata.id;
            textblock.text = `${boxId}`;
            console.log("clikced", pointerInfo.pickInfo.pickedMesh);
            break;
        }
      });

      
      //Функции для установки цвета для боксов после клика кнопки
      var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
      let colorButton = createButton(1, "right");

      colorButton.onPointerUpObservable.add(function () {
        switch (clickedBox.metadata.id) {
          case 1:
            box1.material = boxPickedRed;
            break;
          case 2:
            box2.material = boxPickedRed;
            break;
          case 3:
            box3.material = boxPickedRed;
            break;
          case 4:
            box4.material = boxPickedRed;
            break;
          case null:
            alert("Please select box");
            break;
        }
      });

      advancedTexture.addControl(colorButton);

      let color2Button = createButton(1, "left");
      color2Button.onPointerUpObservable.add(function () {
        switch (clickedBox.metadata.id) {
          case 1:
            box1.material = boxPickedDarkBlue;
            break;
          case 2:
            box2.material = boxPickedDarkBlue;
            break;
          case 3:
            box3.material = boxPickedDarkBlue;
            break;
          case 4:
            box4.material = boxPickedDarkBlue;
            break;
          case null:
            alert("Please select box");
            break;
        }
      });
      advancedTexture.addControl(color2Button);


      //Текстовый блок отображает metadata
      var textblock = createTextBlock();
      advancedTexture.addControl(textblock);


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
//Функция для создания бокса
const createBox = function (id: number, scene: Scene, color: string, x: number, y: number) {
  const box = MeshBuilder.CreateBox("box", { width: 1, height: 1 }, scene);
  box.metadata = {
    id: id,
  };
  let boxMaterialLightGreen = new StandardMaterial("material", scene);
  boxMaterialLightGreen.emissiveColor = new Color3(0.1, 0.8, 0);
  let boxMaterialDarkGreen = new StandardMaterial("material", scene);
  boxMaterialDarkGreen.emissiveColor = new Color3(0.2, 0.48, 0.32);
  box.material = color === "lightGreen"? boxMaterialLightGreen : boxMaterialDarkGreen;
  box.position = new Vector3(x, y, 0);
  return box;
};
//Функция для создания текстового поля
const createTextBlock = function () {
  var textblock = new GUI.TextBlock();
  textblock.height = "150px";
  textblock.fontSize = 50;
  textblock.text = "This block";
  textblock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  return textblock;
};
//Функция для создания кнопки
const createButton = function (id: number, allignment: string) {
  var colorButton = GUI.Button.CreateSimpleButton(`${id}`, "change box color");
  colorButton.width = "150px";
  colorButton.height = "40px";
  colorButton.color = "white";
  colorButton.cornerRadius = 20;
  colorButton.background = "green";
  switch (allignment) {
    case "left":
      colorButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      break;
    case "right":
      colorButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      break;
    default:
      colorButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
      break;
  }
  return colorButton;
};
//Функции для добавления поведения при перетаскивании бокса
const addBoxPrestepAndBehavior = function (
  currentBoxBody:PhysicsBody,
  currentBox:Mesh,
  pointerDragBehavior:PointerDragBehavior
) {
  currentBoxBody.setPrestepType(PhysicsPrestepType.ACTION);
  currentBox.addBehavior(pointerDragBehavior);
};

//Функции для удаления поведения при перетаскивании бокса
const removeBoxPrestepAndBehavior = function (
  currentBox1Body:PhysicsBody,
  currentBox1:Mesh,
  currentBox2Body:PhysicsBody,
  currentBox2:Mesh,
  currentBox3Body:PhysicsBody,
  currentBox3:Mesh,
  pointerDragBehavior:PointerDragBehavior
) {
  currentBox1Body.setPrestepType(PhysicsPrestepType.DISABLED);
  currentBox1.removeBehavior(pointerDragBehavior);
  currentBox2Body.setPrestepType(PhysicsPrestepType.DISABLED);
  currentBox2.removeBehavior(pointerDragBehavior);
  currentBox3Body.setPrestepType(PhysicsPrestepType.DISABLED);
  currentBox3.removeBehavior(pointerDragBehavior);
};
//Функция создания физичексого бокса
const createPhysicBox = function (box:Mesh, scene:Scene) {
  const boxBody = new PhysicsBody(box, PhysicsMotionType.DYNAMIC, false, scene);
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
};
//Функция создания физической земли
const worldBuild = function (ground:Mesh, groundShape:PhysicsShapeBox, scene:Scene) {
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
