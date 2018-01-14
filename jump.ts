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
        cameraPositon: {
            x: 100,
            y: 100,
            z: 100
        },
        cameraLookPositon: new THREE.Vector3(0, 0, 0),
        renderClearColor: "#fbde9f",
        cubeColor: 0xbebebe,
        cubeWidth: 4,
        cubeHeight: 2,
        cubeDeep: 4,
        maxDistance: 5,
        playerColor: "red",
        playerWidth: 1,
        playerheight: 2,
        playerDeep: 1,
        playerMinScale: 0.1,
        playerSpeedD: 0.016,
        playerSpeedY: 0.032
    }
    private readonly threeD: ThreeD;

    public gameStart(): void {
        this.threeD.initRender();
        this.threeD.addCube();
        this.threeD.addCube();
        this.threeD.addPlayer();
        this.threeD.addMouseListener();
    }
}

export default Jump;