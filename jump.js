"use strict";
exports.__esModule = true;
var THREE = require("three");
var threeD_1 = require("./threeD");
var Jump = /** @class */ (function () {
    function Jump() {
        this.config = {
            cameraPositon: new THREE.Vector3(100, 100, 100),
            cameraLookPositon: new THREE.Vector3(100, 0, 100),
            renderClearColor: "#fbde9f",
            lightColor: "#fff"
        };
        this.threeD = new threeD_1["default"](this.config);
    }
    Jump.prototype.gameStart = function () {
        this.threeD.startRender(this.config.renderClearColor);
    };
    return Jump;
}());
exports["default"] = Jump;
