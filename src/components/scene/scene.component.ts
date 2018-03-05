import Vue from 'vue';
import Component from 'vue-class-component';

import sceneEvents from './sceneEvents';
import {Prop, Emit, Watch} from "vue-property-decorator";
import SceneManager from "./manager/SceneManager";

@Component({
    template: require('./scene.component.html'),
})

export class SceneComponent extends Vue {

    @Watch('$store.state.scene.intersectedObject')
    watchHandler() {
        this.intersections(this.$store.state.scene.intersectedObject)
    }

    @Emit(sceneEvents.INTERSECTION)
    intersections(data){
        return data;
    }

    @Prop({ required: true})
    camera: { type: string, position: {x: number, y: number, z:number}, fieldOfView: number, nearPlane: number, farPlane: number };

    private sceneManager;

    created() {
        this.sceneManager = new SceneManager(this.camera);
    }

    mounted() {
        const container: HTMLElement = document.getElementById('scene');
        const parent = container.parentNode;

        parent.replaceChild(this.sceneManager.renderer.domElement, container);
    }
}


