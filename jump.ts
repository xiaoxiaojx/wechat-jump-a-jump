import * as THREE from "three";
import ThreeD, {
    ThreeDParms
} from "./threeD";

interface JumpConfig extends ThreeDParms {
}

class Jump {
    constructor() {
        this.threeD = new ThreeD(this.config);
    }
    private readonly config: JumpConfig = {
        cameraPositon: new THREE.Vector3(100, 100, 100),
        cameraLookPositon: new THREE.Vector3(100, 0, 100),
        renderClearColor: "#fbde9f",
        lightColor: "#fff"
    }
    private readonly threeD: ThreeD;

    public gameStart() {
        this.threeD.startRender(this.config.renderClearColor);
    }
}

export default Jump;