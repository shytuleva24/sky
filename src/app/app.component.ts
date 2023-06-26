import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('c', {static: true}) canvasRef!: ElementRef<HTMLCanvasElement>;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  car!: THREE.Object3D;
  mouseX = 0;
  mouseY = 0;
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  ship: THREE.Object3D | undefined;
  animationId: number | null = null;
  cameraRotationX = 0;
  cameraRotationY = 0;
  cameraRadius = 325; // Расстояние от камеры до корабля


  constructor() {
  }

  ngAfterViewInit() {
    this.init();
    document.addEventListener('scroll', () => this.pauseAnimation());
  }

  init() {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdddddd);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 3000);
    this.renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const shipObject = this.scene.getObjectByName("Boot_Finaal_1");
    if (shipObject) {
      this.camera.lookAt(shipObject.position);

      const cameraOffset = new THREE.Vector3(10, 5, this.cameraRadius);
      this.camera.position.copy(shipObject.position).add(cameraOffset);
    }
    const loader = new GLTFLoader();

    loader.load('https://raw.githubusercontent.com/shytuleva24/ship/main/scene.gltf', (gltf) => {
      this.car = gltf.scene.children[0];
      this.car.scale.set(1, 1, 1);
      this.scene.add(gltf.scene);
      this.scene.traverse((object: THREE.Object3D) => {
        if (object.name === "Boot_Finaal_1") { // Замените "Boot_Finaal_1" на имя вашего корабля
          this.ship = object;
          const cameraOffset = new THREE.Vector3(10, 5, this.cameraRadius);
          this.camera.position.copy(object.position).add(cameraOffset);
        }
      });
      setInterval(() => {
        this.cameraRotationX += 0.004; // Изменение угла вращения по X со временем
        this.cameraRotationY += 0.0006; // Изменение угла вращения по Y со временем
      }, 10);
      this.animate();
    });

    window.addEventListener('resize', () => this.onWindowResize());
    document.addEventListener('mousemove', (event: MouseEvent) => this.onDocumentMouseMove(event));
    document.addEventListener('touchstart', (event: TouchEvent) => this.onDocumentTouchStart(event));
    document.addEventListener('touchmove', (event: TouchEvent) => this.onDocumentTouchMove(event));
  }


  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onDocumentMouseMove(event: MouseEvent) {
    this.mouseX = (event.clientX - this.windowHalfX) / 250;
    this.mouseY = (event.clientY - this.windowHalfY) / 250;
    // this.cameraRotationX = (event.touches[0].pageX - this.windowHalfX) / 250;
    // this.cameraRotationY = (event.touches[0].pageY - this.windowHalfY) / 250;

  }

  onDocumentTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      event.preventDefault();
      // this.mouseX = event.touches[0].pageX - this.windowHalfX;
      // this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
  }

  onDocumentTouchMove(event: TouchEvent) {
    if (event.touches.length === 1) {
      event.preventDefault();
      // this.mouseX = event.touches[0].pageX - this.windowHalfX;
      // this.mouseY = event.touches[0].pageY - this.windowHalfY;
    }
  }

  animate() {
    if (this.ship) {
      const shipPosition = this.ship.position;
      // const cameraRadius = 300; // Расстояние от камеры до корабля
      const cameraRotationSpeed = 0.3; // Скорость вращения камеры
      const cameraOffset = new THREE.Vector3(10, 5, this.cameraRadius); // Смещение камеры относительно корабля
      const cameraPhi = this.cameraRotationY * cameraRotationSpeed;
      const targetX = shipPosition.x + this.cameraRadius * Math.sin(cameraRotationSpeed + this.cameraRotationX * cameraRotationSpeed);
      const targetZ = shipPosition.z + this.cameraRadius * Math.cos(cameraRotationSpeed + this.cameraRotationX * cameraRotationSpeed);

      // const targetY = shipPosition.y + cameraOffset.y + this.mouseY;
      const targetY = THREE.MathUtils.clamp(
        shipPosition.y + this.cameraRadius * Math.sin(cameraPhi) + cameraOffset.y,
        shipPosition.y - Math.sin(THREE.MathUtils.degToRad(5)) * this.cameraRadius, // Ограничение вниз
        shipPosition.y + Math.sin(THREE.MathUtils.degToRad(13)) * this.cameraRadius  // Ограничение вверх
      );
      const rotationSpeed = 0.5; // Скорость вращения камеры
      const smoothness = 0.03; // Сглаживание движения камеры

      this.camera.position.x += (targetX - this.camera.position.x) * smoothness;
      this.camera.position.z += (targetZ - this.camera.position.z) * smoothness;
      this.camera.position.y += (targetY - this.camera.position.y) * smoothness;

      const targetRotationY = -this.cameraRotationX;
      const targetRotationX = -this.cameraRotationY;

      // const rotationThreshold = 0.0001; // Порог для остановки вращения

      // if (Math.abs(this.camera.rotation.y - targetRotationY) > rotationThreshold ||
      //     Math.abs(this.camera.rotation.x - targetRotationX) > rotationThreshold) {
      //     this.camera.rotation.y += (targetRotationY - this.camera.rotation.y) * rotationSpeed;
      //     this.camera.rotation.x += (targetRotationX - this.camera.rotation.x) * rotationSpeed;
      // } else {
      //     this.camera.rotation.y += rotationSpeed;
      // }


      this.camera.lookAt(shipPosition);

    }

    this.renderer.render(this.scene, this.camera);

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  pauseAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resumeAnimation() {
    if (this.animationId === null) {
      this.animate();
    }
  }

}
