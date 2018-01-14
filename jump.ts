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
        renderClearColor: "#fbde9f",
        cubeColor: "#ca746e",
        cubeWidth: 4,
        cubeHeight: 2,
        cubeDeep: 4,
        maxDistance: 5,
        playerColor: "red",
        playerWidth: 1,
        playerheight: 2,
        playerDeep: 1,
        playerMinScale: 0.1,
        playerSpeedD: 0.004,
        playerSpeedY: 0.008
    }
    private readonly threeD: ThreeD;
    private addRestartListener(): void {
        const _self = this;
        const restart: HTMLButtonElement = document.getElementById("restart") as HTMLButtonElement;
        restart.addEventListener("click", _self.gameRestart.bind(_self));
    }

    public gameStart(): void {
        this.threeD.initRender();
        this.threeD.initCamera();
        this.threeD.addCube();
        this.threeD.addCube();
        this.threeD.addPlayer();
        this.addRestartListener();
        this.threeD.addMouseListener();
    }
    public gameRestart(): void {
        this.threeD.initProperty();
        this.threeD.initCamera();
        this.threeD.addCube();
        this.threeD.addCube();
        this.threeD.addPlayer();
        this.threeD.addMouseListener();
    }
}

export default Jump;