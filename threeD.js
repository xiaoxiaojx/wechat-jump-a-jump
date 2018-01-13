"use strict";
exports.__esModule = true;
var THREE = require("three");
var ThreeD = /** @class */ (function () {
    function ThreeD(parms) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.light = new THREE.AmbientLight(parms.lightColor);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.initCamera(parms.cameraPositon, parms.cameraLookPositon);
        this.initLight();
    }
    ThreeD.prototype.initCamera = function (cameraPositon, cameraLookPositon) {
        this.camera.position = cameraPositon;
        this.camera.lookAt(cameraLookPositon);
    };
    ThreeD.prototype.initLight = function () {
        this.light.position.set(100, 100, 100);
        this.scene.add(this.light);
    };
    ThreeD.prototype.startRender = function (color) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(color), 1.0);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    };
    return ThreeD;
}());
exports["default"] = ThreeD;
