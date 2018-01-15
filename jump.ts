import * as THREE from "three";
import ThreeD, {
    ThreeDParms
} from "./threeD";

enum Level {
    EASY = "简单",
    MEDIUM = "中等",
    DIFFICULT = "困难",
    NONE = "NONE"
}

interface JumpConfig extends ThreeDParms {
}

class Jump {
    constructor() {
        this.threeD = new ThreeD(this.config);
        this.appDom = document.getElementById("app") as HTMLDivElement;
        this.startDom = document.getElementById("jump_startGame") as HTMLButtonElement;
        this.restartDom = document.getElementById("jump_restartGame") as HTMLButtonElement;
        this.scoreDom = document.getElementById("score") as HTMLDivElement;
        this.scoreTotalDom = document.getElementById("scoreTotal") as HTMLSpanElement;
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
        playerSpeedY: 0.008,
        onPlayerFail: this.gameOver.bind(this),
        onPlayerSuccess: this.addScore.bind(this)
    }
    private readonly threeD: ThreeD;
    private readonly startDom: HTMLButtonElement;
    private readonly restartDom: HTMLButtonElement;
    private readonly appDom: HTMLDivElement;
    private readonly scoreDom: HTMLDivElement;
    private readonly scoreTotalDom: HTMLSpanElement;

    private updateConfigByLevel(): void {
        const level = this.getLevel();
        switch (level) {
            case Level.EASY:
                this.config.cubeDeep = 4;
                this.config.cubeWidth = 4;
                break;
            case Level.MEDIUM:
                this.config.cubeDeep = 4;
                this.config.cubeWidth = 2;
                break;
            case Level.DIFFICULT:
                this.config.cubeDeep = 2;
                this.config.cubeWidth = 2;
                break;
        }
    }
    private addScore(): void {
        if (this.scoreTotalDom) {
            const currentScoreTotal = Number(this.scoreTotalDom.innerHTML);
            this.scoreTotalDom.innerHTML = String(100 + currentScoreTotal);
        }   
    }
    private initScore(): void {
        if (this.scoreTotalDom) {
            this.scoreTotalDom.innerHTML = "0";
        }
    }
    private addRestartListener(): boolean {
        const _self = this;
        if ( this.restartDom ) {
            this.restartDom.addEventListener("click", _self.gameRestart.bind(_self));
            return true;
        }
        return false;
    }
    private addStartListener(): boolean {
        const _self = this;
        if ( this.startDom ) {
            this.startDom.addEventListener("click", _self.gameStart.bind(_self));
            return true;
        }
        return false;
    }
    private hiddenAppDom(): void {
        if (this.appDom) {
            this.appDom.style.display = "none";
        }
    }
    private showAppDom(): void {
        if (this.appDom) {
            this.appDom.style.display = "block";
        }
    }
    private hiddenStartDom(): void {
        if (this.startDom) {
            this.startDom.style.display = "none";
        }
    }
    private showRestartDom(): void {
        if (this.restartDom) {
            this.restartDom.style.display = "inline-block";
        }
    }
    private hiddenScoreDom(): void {
        if (this.scoreDom) {
            this.scoreDom.style.display = "none";
        }
    }
    private showScoreDom(): void {
        if (this.scoreDom) {
            this.scoreDom.style.display = "block";
        }
    }
    private getLevel(): Level {
        const select: HTMLSelectElement = document.getElementById("jump_select") as HTMLSelectElement;
        if (select) {
            return select.value as Level;
        }
        return Level.NONE;
    }

    public startRender(): void {
        this.addStartListener();
    }
    public gameStart(): void {
        this.hiddenAppDom();
        this.showScoreDom();
        this.hiddenStartDom();
        this.showRestartDom();
        this.updateConfigByLevel();
        this.threeD.initRender();
        this.threeD.initCamera();
        this.threeD.addCube();
        this.threeD.addCube();
        this.threeD.addPlayer();
        this.addRestartListener();
        this.threeD.addMouseListener();
    }
    public gameRestart(): void {
        this.hiddenAppDom();
        this.showScoreDom();
        this.initScore();
        this.updateConfigByLevel();
        this.threeD.initProperty();
        this.threeD.initCamera();
        this.threeD.addCube();
        this.threeD.addCube();
        this.threeD.addPlayer();
        this.threeD.addMouseListener();
    }
    public gameOver(): void {
        this.showAppDom();
    }
}

export default Jump;