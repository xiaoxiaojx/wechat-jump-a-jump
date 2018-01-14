import * as THREE from "three";

interface Position {
    x: number,
    y: number,
    z: number
}

interface Square {
    dWidth: number;
    d: number;
}

enum Direction {
    TOP = "TOP",
    RIGHT = "RIGHT",
    NONE = "NONE"
}

enum JumpStatus {
    NOMAL = "NOMAL",
    READY = "READY",
    FLIGHT = "FLIGHT",
    FLIGHTEND = "FLIGHTEND"
}

enum PositionRelation {
    CENTER = "CENTER",
    OUTSIDE = "OUTSIDE",
    EDGE = "EDGE"
}

interface PlayerSpeed {
    d: number;
    y: number;
}

export interface ThreeDParms {
    cameraPositon: Position;
    cameraLookPositon: THREE.Vector3;
    renderClearColor: string;
    maxDistance: number;
    cubeColor: number;
    cubeWidth: number;
    cubeHeight: number;
    cubeDeep: number;
    playerColor: string;
    playerWidth: number;
    playerheight: number;
    playerDeep: number;
    playerMinScale: number;
    playerSpeedD: number;
    playerSpeedY: number;
}

export default class ThreeD {
    constructor(parms: ThreeDParms) {
        this.dynamicParms = Object.create(parms);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(6, window.innerWidth / window.innerHeight, 1, 10000);
        this.light1 = new THREE.AmbientLight(0xffffff, 0.3);
        this.light2 = new THREE.DirectionalLight(0xffffff, 0.5);
        this.renderer = new THREE.WebGLRenderer({ antialias : true });

        this.initCamera();
        this.initLight();
        this.readyToJump = this.readyToJump.bind(this);
        this.recoveryScale = this.recoveryScale.bind(this);
        this.startFlight = this.startFlight.bind(this);
    }
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.Camera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly light1: THREE.AmbientLight;
    private readonly light2: THREE.DirectionalLight;
    private readonly cubeItems: THREE.Mesh[] = [];
    private readonly dynamicParms: ThreeDParms;
    private player: THREE.Mesh;
    private playerJumpStatus: JumpStatus = JumpStatus.NOMAL;
    private playerSpeed: PlayerSpeed = {d: 0, y: 0};

    private initCamera(): void {
        const { cameraPositon, cameraLookPositon } = this.dynamicParms;
        this.camera.position.set(cameraPositon.x, cameraPositon.y, cameraPositon.z);
        this.camera.lookAt(cameraLookPositon);
    }
    private initLight(): void {
        this.light1.position.set(0, 0, 100);
        this.light2.position.set(8, 3, 0);
        this.scene.add(this.light1);
        this.scene.add(this.light2);
    }
    public initRender(): void {
        const { renderClearColor } = this.dynamicParms;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(renderClearColor), 1.0);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
    }
    public addPlayer(): void {
        const { playerColor, playerWidth, playerDeep, playerheight } = this.dynamicParms;
        const material = new THREE.MeshLambertMaterial({color: new THREE.Color(playerColor)});
        const geometry = new THREE.CubeGeometry(playerWidth, playerheight, playerDeep);       
        geometry.translate(0, playerDeep, 0); 
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 1, 0);
        this.player = mesh;
        this.scene.add(mesh);
        this.renderer.render(this.scene, this.camera);
    }
    public addCube(): void {
        const { cubeColor, cubeWidth, cubeHeight, cubeDeep } = this.dynamicParms;
        const material = new THREE.MeshLambertMaterial({color: new THREE.Color(cubeColor)});
        const geometry = new THREE.CubeGeometry(cubeWidth, cubeHeight, cubeDeep);
        const mesh = new THREE.Mesh(geometry, material);
        let position: Position = {
            x: 0,
            y: 0,
            z: 0
        };
        if ( this.cubeItems.length !== 0 ) {
            const lastCube = this.cubeItems[this.cubeItems.length -1];
            position = this.getDirection() === Direction.RIGHT ?
                {
                    x: lastCube.position.x,
                    y: lastCube.position.y,
                    z: lastCube.position.z - (this.getDistance() + this.dynamicParms.cubeDeep)
                }
                :
                {
                    x: lastCube.position.x - (this.getDistance() + this.dynamicParms.cubeWidth),
                    y: lastCube.position.y,
                    z: lastCube.position.z
                }
        }
        mesh.position.set(position.x, position.y, position.z);
        this.cubeItems.push(mesh)
        this.scene.add(mesh);
        this.renderer.render(this.scene, this.camera);
    }
    private readyToJump(): void {
        const { playerMinScale } = this.dynamicParms;
        if(this.playerJumpStatus === JumpStatus.READY && this.player.scale.y > playerMinScale) {
            this.player.scale.y -= 0.01;
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.readyToJump)
        }
    }
    private recoveryScale(): void {
        if (this.playerJumpStatus === JumpStatus.FLIGHT && this.player.scale.y < 1) {
            this.player.scale.y += 0.05;
            this.playerSpeed.d += this.dynamicParms.playerSpeedD;
            this.playerSpeed.y += this.dynamicParms.playerSpeedY;
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.recoveryScale)
        }
    }
    private startFlight(): void {
        const lastCube = this.cubeItems[this.cubeItems.length -1];
        const secCube = this.cubeItems[this.cubeItems.length -2];
        if (this.playerJumpStatus === JumpStatus.FLIGHT && this.player.position.y >= 1) {
            const direct = lastCube.position.x === secCube.position.x ?
                "z" : "x";
            this.player.position.y += this.playerSpeed.y;
            this.player.position[direct] -= this.playerSpeed.d;
            this.playerSpeed.y -= 0.01
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.startFlight);
        } else {
            this.playerJumpStatus = JumpStatus.FLIGHTEND;
            this.player.position.y = 1;
            this.renderer.render(this.scene, this.camera);
            this.judgePosition();
        }
    }
    private failureAnimation(): void {

    }
    private judgePosition() {
        const lastCube = this.cubeItems[this.cubeItems.length -1];
        const secCube = this.cubeItems[this.cubeItems.length -2];
        const direct = lastCube.position.x === secCube.position.x ?
                "z" : "x";
        const relation = this.getPositionRelation({
            d: this.player.position[direct],
            dWidth: direct === "z" ? this.dynamicParms.playerDeep : this.dynamicParms.playerWidth
        }, {
            d: lastCube.position[direct],
            dWidth: direct === "z" ? this.dynamicParms.cubeDeep : this.dynamicParms.cubeWidth
        });
        switch (relation) {
            case PositionRelation.CENTER:
                this.playerJumpStatus = JumpStatus.NOMAL;
                this.addCube();
                break;
            case PositionRelation.EDGE:
                this.failureAnimation();
                break;
            default:
                console.log("Game Over");
        }
    }

    private getDirection(): Direction {
        return Math.random() > 0.5 ? Direction.TOP : Direction.RIGHT;
    }
    private getDistance(): number {
        return Math.random() * this.dynamicParms.maxDistance;
    }
    private getPositionRelation(s1: Square, s2: Square): PositionRelation {
        if (s1.d + s1.dWidth/2 < s2.d - s2.dWidth/2 || s1.d - s1.dWidth/2 > s2.d + s2.dWidth/2) {
            return PositionRelation.OUTSIDE;
        }
        else if (s1.d > s2.d - s2.dWidth/2 && s1.d < s2.d + s2.dWidth/2) {
            return PositionRelation.CENTER;
        }
        else {
            return PositionRelation.EDGE;
        }
    }
    private handleMousedown(): void {
        switch (this.playerJumpStatus) {
            case JumpStatus.NOMAL:
                this.playerJumpStatus = JumpStatus.READY;
                this.readyToJump();
        }
    }
    private handleMouseup(): void {
        switch (this.playerJumpStatus) {
            case JumpStatus.READY:
                this.playerJumpStatus = JumpStatus.FLIGHT;
                this.recoveryScale();
                this.startFlight();
        }
    }
    public addMouseListener(): void {
        const _self = this;
        window.addEventListener("mousedown", _self.handleMousedown.bind(_self), false);
        window.addEventListener("mouseup", _self.handleMouseup.bind(_self), false);
    }

}