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
    renderClearColor: string;
    maxDistance: number;
    cubeColor: string;
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
    listener: HTMLElement;
    onPlayerFail: Function;
    onPlayerSuccess: Function;
}

export default class ThreeD {
    constructor(parms: ThreeDParms) {
        this.dynamicParms = parms;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(6, window.innerWidth / window.innerHeight, 1, 10000);
        this.light1 = new THREE.AmbientLight(0xffffff, 0.8);
        this.light2 = new THREE.DirectionalLight(0xffffff, 0.1);
        this.renderer = new THREE.WebGLRenderer({ antialias : true });

        this.readyToJump = this.readyToJump.bind(this);
        this.recoveryScale = this.recoveryScale.bind(this);
        this.startFlight = this.startFlight.bind(this);
        this.moveCameraLook = this.moveCameraLook.bind(this);
    }
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.Camera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly light1: THREE.AmbientLight;
    private readonly light2: THREE.DirectionalLight;
    private readonly dynamicParms: ThreeDParms;
    private cubeItems: THREE.Mesh[] = [];
    private lookAtPositin: Position = {x: 0, y: 0, z: 0};
    private player: THREE.Mesh;
    private playerJumpStatus: JumpStatus = JumpStatus.NOMAL;
    private playerSpeed: PlayerSpeed = {d: 0, y: 0};

    public initCamera(): void {
        this.camera.position.set(100, 100, 100);
        this.camera.lookAt(new THREE.Vector3(this.lookAtPositin.x, this.lookAtPositin.y, this.lookAtPositin.z));
    }
    public initLight(): void {
        this.light1.position.set(0, 0, 100);
        this.light2.position.set(5, 2, -5);
        this.light2.castShadow = true;
        this.scene.add(this.light1);
        this.scene.add(this.light2);
    }
    public initRender(): void {
        const { renderClearColor } = this.dynamicParms;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color(renderClearColor), 1.0);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.clear();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
        this.renderer.render(this.scene, this.camera);
    }
    public initProperty(): void {
        this.playerJumpStatus = JumpStatus.NOMAL;
        this.lookAtPositin = {x: 0, y: 0, z: 0};
        this.playerSpeed = {d: 0, y: 0};
        this.scene.remove(this.player);
        this.cubeItems.forEach(item => this.scene.remove(item));
        this.cubeItems = [];
        this.renderer.render(this.scene, this.camera);
    }
    public addFloor(): void {
        const material = new THREE.MeshLambertMaterial({color: new THREE.Color(this.dynamicParms.renderClearColor)});
        const geometry = new THREE.CubeGeometry(window.innerWidth, 1, window.innerHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.position.y = -1;
        this.scene.add(mesh);
        this.renderer.render(this.scene, this.camera);
    }
    public addPlayer(): void {
        const { playerColor, playerWidth, playerDeep, playerheight } = this.dynamicParms;
        const material = new THREE.MeshLambertMaterial({color: new THREE.Color(playerColor)});
        const geometry = new THREE.CubeGeometry(playerWidth, playerheight, playerDeep);       
        geometry.translate(0, playerDeep, 0); 
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 1, 0);
        mesh.castShadow = true;
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
        if ( this.cubeItems.length >= 6) {
            this.scene.remove(this.cubeItems.shift() as THREE.Mesh);
        }
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.cubeItems.push(mesh)
        this.scene.add(mesh);
        this.renderer.render(this.scene, this.camera);
    }
    private readyToJump(): void {
        const { playerMinScale } = this.dynamicParms;
        if(this.playerJumpStatus === JumpStatus.READY && this.player.scale.y > playerMinScale) {
            this.player.scale.y -= 0.01;
            this.playerSpeed.d += this.dynamicParms.playerSpeedD;
            this.playerSpeed.y += this.dynamicParms.playerSpeedY;
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.readyToJump)
        }
    }
    private recoveryScale(): void {
        if (this.playerJumpStatus === JumpStatus.FLIGHT && this.player.scale.y < 1) {
            this.player.scale.y += 0.05;
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.recoveryScale)
        }
    }
    private startFlight(playerSpeedY: number): void {
        const _slef = this;
        let speedY = playerSpeedY;
        const lastCube = this.cubeItems[this.cubeItems.length -1];
        const secCube = this.cubeItems[this.cubeItems.length -2];
        if (this.playerJumpStatus === JumpStatus.FLIGHT && this.player.position.y >= 1) {
            const direct = lastCube.position.x === secCube.position.x ?
                "z" : "x";
            this.player.position.y += speedY;
            this.player.position[direct] -= this.playerSpeed.d;
            speedY -= 0.01
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(() => _slef.startFlight(speedY));
        } else {
            this.playerJumpStatus = JumpStatus.FLIGHTEND;
            this.player.position.y = 1;
            this.renderer.render(this.scene, this.camera);
            this.playerSpeed.d = 0;
            this.playerSpeed.y = 0;
            this.judgePosition();
        }
    }
    private failureAnimation(angle: number = 0, condition: boolean = true): void {
        const lastCube = this.cubeItems[this.cubeItems.length -1];
        const secCube = this.cubeItems[this.cubeItems.length -2];
        const direct = lastCube.position.x === secCube.position.x ?
            Direction.RIGHT : Direction.TOP;
        const step = 0.1;

        if (condition) {
            if (direct === Direction.RIGHT) {
                if (this.player.position.z > lastCube.position.z) {
                    this.player.rotation.x = angle + step;
                    this.renderer.render(this.scene, this.camera);
                    requestAnimationFrame(() => this.failureAnimation(angle + step, angle + step < Math.PI/2));
                } else {
                    this.player.rotation.x = angle - step;
                    this.renderer.render(this.scene, this.camera);
                    requestAnimationFrame(() => this.failureAnimation(angle - step, angle - step > -Math.PI/2))
                }
            } else {
                if (this.player.position.x > lastCube.position.x) {
                    this.player.rotation.z = angle - step;
                    this.renderer.render(this.scene, this.camera);
                    requestAnimationFrame(() => this.failureAnimation(angle - step, angle - step > -Math.PI/2));
                } else {
                    this.player.rotation.z = angle + step;
                    this.renderer.render(this.scene, this.camera);
                    requestAnimationFrame(() => this.failureAnimation(angle + step, angle + step < Math.PI/2))
                }
            }
        } else {
            this.declineAnimation();
        }
    }
    private declineAnimation(): void {
        this.player.position.y = 0;
        this.renderer.render(this.scene, this.camera);
        this.removeMouseListener();
        this.dynamicParms.onPlayerFail();
    }
    private moveCameraLook(): void {
        const lastCube = this.cubeItems[this.cubeItems.length -1];
        const secCube = this.cubeItems[this.cubeItems.length -2];
        const targetX = (lastCube.position.x + secCube.position.x) /2 + 4;
        const targetZ = (lastCube.position.z + secCube.position.z) /2 + 4;
        const currentX = this.lookAtPositin.x;
        const currentZ = this.lookAtPositin.z;
        if (currentX > targetX) {
            this.lookAtPositin.x =  currentX - 0.2;
            this.camera.lookAt(new THREE.Vector3(this.lookAtPositin.x, this.lookAtPositin.y, this.lookAtPositin.z));
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.moveCameraLook);
        } else if (currentZ > targetZ) {
            this.lookAtPositin.z =  currentZ - 0.2;
            this.camera.lookAt(new THREE.Vector3(this.lookAtPositin.x, this.lookAtPositin.y, this.lookAtPositin.z));
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.moveCameraLook);
        }
    }
    private judgePosition(): void {
        const _self = this;
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
                this.dynamicParms.onPlayerSuccess();
                setTimeout(() => _self.moveCameraLook(), 500)
                break;
            case PositionRelation.EDGE:
                this.failureAnimation();
                break;
            default:
                this.declineAnimation();
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
    private isPC(): boolean {
        const n = navigator.userAgent;
        return !Boolean(n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i));
    }
    private handleMousedown(): void {
        switch (this.playerJumpStatus) {
            case JumpStatus.NOMAL:
                this.playerJumpStatus = JumpStatus.READY;
                this.readyToJump();
            break;
        }
    }
    private handleMouseup(): void {
        switch (this.playerJumpStatus) {
            case JumpStatus.READY:
                this.playerJumpStatus = JumpStatus.FLIGHT;
                this.recoveryScale();
                this.startFlight(this.playerSpeed.y);
            break;
        }
    }
    public addMouseListener(): void {
        const _self = this;
        this.dynamicParms.listener.addEventListener(this.isPC() ? "mousedown" : "touchstart", _self.handleMousedown.bind(_self));
        this.dynamicParms.listener.addEventListener(this.isPC() ? "mouseup" : "touchend", _self.handleMouseup.bind(_self));
    }
    public removeMouseListener(): void {
        const _self = this;
        this.dynamicParms.listener.removeEventListener(this.isPC() ? "mousedown" : "touchstart", _self.handleMousedown.bind(_self));
        this.dynamicParms.listener.removeEventListener(this.isPC() ? "mouseup" : "touchend", _self.handleMouseup.bind(_self));
    }
}