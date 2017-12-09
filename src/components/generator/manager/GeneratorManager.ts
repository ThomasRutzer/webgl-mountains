import LightFactory from './../../light';
import SceneObjectModel from './../../scene/model/SceneObjectModel';
import Scene from '../../scene/manager/SceneManager';
import {Mountain} from './../../mountain';
import GeneratorManagerConfig from './GeneratorManagerConfig';
import { rangeRandomInt } from './../../math-utils';
import TextureProvider from './../../texture-provider/';
import CustomMesh from './../../custom-mesh';
import { rangeRandom } from './../../math-utils';

class GeneratorManager {
    private scene:Scene;
    private mountainsData;
    private mountains:{id:string, mountain:Mountain}[];
    private positioning:{side:string, leftOffset:number, rightOffset:number};

    // used to create unique id
    private allMountainCounter = 0;
    private globalLight;
    private shadowLight;
    private texture: THREE.Texture;

    constructor(scene:Scene, mountainsData:Object[] = []) {
        this.scene = scene;
        this.mountainsData = mountainsData;
        this.mountains = [];

        this.resetPositioning();
        this.addGlobalLight();
        this.addShadowLight();

        this.getTexture().then(() => {
            mountainsData.forEach((mountainData) => {
                this.addMountain(mountainData);
            });

            this.addFloor();
        });
    }

    addFloor(): void {
        let floorCol = GeneratorManagerConfig.floor.color;
        const mesh =  CustomMesh.planeMesh(1600,1600,12, floorCol);
        const geom: any = mesh.geometry;

        const vertices =  geom.vertices;
        for (let i=0; i < vertices.length; i++){
            let v = vertices[i];
            v.x += rangeRandom(-10,10);
            v.y += rangeRandom(-10,10);
            v.z += rangeRandom(-10,10);
        }

        geom.computeFaceNormals();
        geom.verticesNeedUpdate = true;
        geom.colorsNeedUpdate = true;

        mesh.rotation.x = -Math.PI / 2;
        this.scene.addElement(SceneObjectModel.create('floor', mesh));
    }

    addGlobalLight() {
        this.globalLight = LightFactory.create('global', '#fff', '#fff', 0.8);
        this.scene.addElement(SceneObjectModel.create('globalLight', this.globalLight.lightElement));
    }

    addShadowLight() {
        this.shadowLight = LightFactory.create('directional', '#fff', 0.5, {castShadow: true});
        this.scene.addElement(SceneObjectModel.create('shadowLight', this.shadowLight.lightElement, {
            x: 100,
            y: 150,
            z: 100
        }));
    }

    addMountain(data) {
        let posX = this.determinePosition(data.thickness);

        const mountain = Mountain.create(data.height, data.thickness, this.texture);

        this.scene.addElement(SceneObjectModel.create(`mountain-${this.allMountainCounter}`,
            mountain.mesh, {y: 0, x: posX, z: rangeRandomInt(GeneratorManagerConfig.shiftX[0], GeneratorManagerConfig.shiftX[1])}));

        this.allMountainCounter++;
        this.mountains.push({
            id: `mountain-${this.allMountainCounter}`,
            mountain: mountain
        });
    }

    private determinePosition(offset): number {
        let posX = 0;

        if (this.mountains.length === 0) {
            this.positioning.leftOffset += (offset - GeneratorManagerConfig.overlapping);
            this.positioning.rightOffset += (offset - GeneratorManagerConfig.overlapping);

            return posX;
        }

        if ( this.positioning.side === 'left' ) {
            posX = this.positioning.leftOffset * -1;
            this.positioning.leftOffset += (offset - GeneratorManagerConfig.overlapping);
            this.positioning.side = 'right';
        } else {
            posX = this.positioning.rightOffset;
            this.positioning.rightOffset += (offset - GeneratorManagerConfig.overlapping);
            this.positioning.side = 'left';
        }

        return posX;
    }

    private getTexture(): Promise<any> {
        let returnPromiseResolve = new Function();
        const returnPromise = new Promise((res) => {
            returnPromiseResolve = res;
        });

        TextureProvider.loadByUrl(GeneratorManagerConfig.textureUrl).then((tex) => {
            this.texture = tex;
            returnPromiseResolve();
        });

        return returnPromise;
    }

    clearMountain(mountainId): Promise<any> {
        let returnPromiseResolve = new Function();
        const returnPromise = new Promise((res) => {
            returnPromiseResolve = res;
        });
        const allPromises = [];
        let index = null;

        this.mountains.forEach( (mountainElement, i) => {
            if (mountainElement.id === mountainId) {
                allPromises.push(mountainElement.mountain.shrink(true));
                index = i;
            }
        });

        Promise.all(allPromises).then(() => {
            this.scene.removeElement(mountainId);
            this.mountains.splice(index, 1);
            returnPromiseResolve();
        });

        return returnPromise;
    }

    clearAllMountains(): Promise<any> {
        let returnPromiseResolve = new Function();
        const returnPromise = new Promise((res) => {
            returnPromiseResolve = res;
        });
        const allPromises = [];

        this.mountains.forEach((mountainElement, index) => {

            allPromises.push(mountainElement.mountain.shrink(true));
            this.scene.removeElement(mountainElement.id);

        });

        Promise.all(allPromises).then(() => {
            this.mountains = [];
            this.resetPositioning();
            returnPromiseResolve();
        });

        return returnPromise;
    }

    /**
     * handles placement of mountains to each other
     * @type {number}side -> handles if mountain shall be placed left or right from x=0
     * @type {number}leftOffset ->  stores thickness of all mountains on the left side
     * @type {number}rightOffset -> stores thickness of all mountains on the right side
     */
    private resetPositioning() {
        this.positioning = {
            side: GeneratorManagerConfig.initialSide,
            leftOffset: 0,
            rightOffset: 0
        };
    }
}

export default GeneratorManager;