import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  MultiMaterial,
  Scene,
  StandardMaterial,
  SubMesh,
  Texture,
  Vector3
} from 'babylonjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  @ViewChild('renderCanvas') babylonCanvas: ElementRef;

  private camera: ArcRotateCamera;
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;

  constructor() { }

  ngAfterViewInit(): void {
    this.canvas = this.babylonCanvas.nativeElement;
    this.engine = new Engine(this.canvas, true); // Generate the BABYLON 3D engine

    this.createScene();
    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        console.log('pointerInfo, ', pointerInfo.pickInfo);
      }
    });


    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  createScene(): void {
    this.scene = new Scene(this.engine);
    this.scene.clearColor = Color4.FromHexString('#FFFFFF');

    this.camera = new ArcRotateCamera('camera', 1.0, 1.0, 12, Vector3.Zero(), this.scene);
    this.camera.attachControl(this.canvas, false);
    this.camera.lowerRadiusLimit = this.camera.upperRadiusLimit = this.camera.radius;

    const light = new HemisphericLight('hemi', new Vector3(0.66, 0.66, 0.33), this.scene);
    light.groundColor = new Color3(.5, .5, .5);

    const box = MeshBuilder.CreateBox('box', { size: 5 });
    box.showBoundingBox = false;

    const multiMat = new MultiMaterial('sides', this.scene);

    const githubSide = new StandardMaterial('side1', this.scene);
    githubSide.diffuseColor = new Color3(0.898, 0.224, .208);
    githubSide.diffuseTexture = new Texture('./assets/githubLogo.jpg', this.scene);

    multiMat.subMaterials.push(githubSide);

    const side2 = new StandardMaterial('side2', this.scene);
    side2.diffuseColor = new Color3(0.925, 0.251, .478);
    multiMat.subMaterials.push(side2);

    const side3 = new StandardMaterial('side3', this.scene);
    side3.diffuseColor = new Color3(0.404, 0.227, 0.718);
    multiMat.subMaterials.push(side3);

    const side4 = new StandardMaterial('side4', this.scene);
    side4.diffuseColor = new BABYLON.Color3(0.129, 0.558, .953);
    multiMat.subMaterials.push(side4);

    const side5 = new StandardMaterial('side5', this.scene);
    side5.diffuseColor = new BABYLON.Color3(0, 0.737, .831);
    multiMat.subMaterials.push(side5);

    const side6 = new StandardMaterial('side6', this.scene);
    side6.diffuseColor = new BABYLON.Color3(0.400, 0.733, .416);
    multiMat.subMaterials.push(side6);

    const verticesCount = box.getTotalVertices();

    box.subMeshes = [];
    box.subMeshes.push(new SubMesh(0, 0, verticesCount, 0, 6, box));
    box.subMeshes.push(new SubMesh(1, 1, verticesCount, 6, 6, box));
    box.subMeshes.push(new SubMesh(2, 2, verticesCount, 12, 6, box));
    box.subMeshes.push(new SubMesh(3, 3, verticesCount, 18, 6, box));
    box.subMeshes.push(new SubMesh(4, 4, verticesCount, 24, 6, box));
    box.subMeshes.push(new SubMesh(5, 5, verticesCount, 30, 6, box));

    box.material = multiMat;
    box.position.y = 0.5;
  }

}
