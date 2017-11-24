import {expect} from 'chai';
import {spy, assert} from 'sinon';
import SceneFactory from './SceneFactory';
import SceneObjectModel from './../model/SceneObjectModel';
import * as THREE from 'THREE';

describe('SceneFactory', () => {

    describe('constructor()', () => {
        it('calls method loop when passed argument "autoUpdate" is true', () => {
            let factory;
            const loopMethodSpy = spy(SceneFactory.prototype, 'loop');

            factory = new SceneFactory(
                100,
                100,
                {type: 'perspective', fieldOfView: 60, nearPlane: 0.1, farPlane: 3000, position: {x: 0, y: 0, z: 150}},
                'webGL',
                true);

            assert.called(loopMethodSpy);
        });
    });

    describe('method addElement()', () => {

        let factory = null;

        beforeEach(() => {
            factory = new SceneFactory(
                100,
                100,
                {type: 'perspective', fieldOfView: 60, nearPlane: 0.1, farPlane: 3000, position: {x: 0, y: 0, z: 150}},
                'webGL',
                true);
        });

        it('adds Element to both, ThreeJS Scene and elemens array', () => {
            const element = new THREE.Object3D();
            const elementId = 'test';
            factory.addElement(SceneObjectModel.create(elementId, element));

            expect((<any>factory).sceneElements[0].id).to.equal(elementId);
            expect((<any>factory).sceneElement.getObjectByName(elementId).name).to.equal(elementId);
        });

        it('throws error when same Id is added twice', () => {
            const element = new THREE.Object3D();
            const elementId = 'test';
            factory.addElement(SceneObjectModel.create(elementId, element));

            expect(() => {factory.addElement(SceneObjectModel.create(elementId, element))}).to.throw();
        });

        it('throws error passed element is not of type SceneObjectModel', () => {
            const element = new THREE.Object3D();
            const elementId = 'test';

            expect(() => {factory.addElement(elementId, element)}).to.throw();
        });
    });

    describe('method removeElement()', () => {
        let factory = null;

        beforeEach(() => {
            factory = new SceneFactory(
                100,
                100,
                {type: 'perspective', fieldOfView: 60, nearPlane: 0.1, farPlane: 3000, position: {x: 0, y: 0, z: 150}},
                'webGL',
                true);
        });

        it('removes Element from both, ThreeJS Scene and elemens array', () => {
            const element = new THREE.Object3D();
            const elementId = 'test';
            let isIn = false;

            factory.addElement(SceneObjectModel.create(elementId, element));
            factory.removeElement(elementId);

            (<any>factory).sceneElements.forEach((element) => {
                if(element.id === elementId) {
                    isIn = true;
                }
            })

            expect(isIn).to.be.false;
            expect((<any>factory).sceneElement.getObjectByName(elementId)).to.be.undefined;
        });
    });
    describe('method loop()', () => {
        it('calls method render', () => {
            let factory = new SceneFactory(
                    100,
                    100,
                    {type: 'perspective', fieldOfView: 60, nearPlane: 0.1, farPlane: 3000, position: {x: 0, y: 0, z: 150}},
                    'webGL',
                    true);

            const renderMethodSpy = spy(factory, 'render');

            factory.loop();
            assert.called(renderMethodSpy);
        });
    });
});