import * as THREE from "three";

interface position {
    x: number,
    y: number,
    z: number
}

export interface ThreeDParms {
    cameraPositon: position;
    cameraLookPositon: THREE.Vector3;
    renderClearColor: string;
    lightColor: string;
}

export default class ThreeD {
    constructor(parms: ThreeDParms) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );
        this.light = new THREE.AmbientLight(parms.lightColor);
        this.renderer = new THREE.WebGLRenderer({ antialias : true });

        this.initCamera(parms.cameraPositon, parms.cameraLookPositon);
        this.initLight();
    }
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.Camera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly light: THREE.AmbientLight;

    private initCamera(cameraPositon: position, cameraLookPositon: THREE.Vector3) {
        this.camera.position.set(cameraPositon.x, cameraPositon.y, cameraPositon.z);
        this.camera.lookAt(cameraLookPositon);
    }
    private initLight() {
        this.light.position.set(100, 100, 100);
        this.scene.add(this.light);
    }
    public startRender(color: string) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(color), 1.0);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }
}