import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from './Experience.js'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'

import { GUI } from 'dat.gui'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.resources = this.experience.resources

        this.cameraTarget = new THREE.Vector3()

        this.setInstance()

        this.testing = false

        this.setControls()
        
        if (!this.experience.playing){
            // when editing, see axis
            this.setAxis()
        }

        // wait until all models are classified
        this.experience.world.on('classified', () => {
            // gets player model
            this.player = this.experience.world.player.model
        });

        this.idealOffset = new THREE.Vector3(0, 30, 3)
        this.idealLookat = new THREE.Vector3(0.3, 20, 0)

        /*
        var gui = new GUI();
        gui.add(this.idealOffset, 'x', -20, 20);
        gui.add(this.idealOffset, 'y', -20, 20);
        gui.add(this.idealOffset, 'z', -20, 20);
        gui.add(this.idealLookat, 'x', -20, 20);
        gui.add(this.idealLookat, 'y', -20, 20);
        gui.add(this.idealLookat, 'z', -20, 20);
        */
    }

    setAxis(){
        // Create the axis indicator
        this.axisIndicator = new THREE.Object3D();

        // Add the axis indicator to the scene
        this.scene.add(this.axisIndicator);

        // Create the x-axis arrow
        var xArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 0.01, 0xff0000);

        // Create the y-axis arrow
        var yArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 0.01, 0x00ff00);

        // Create the z-axis arrow
        var zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 0.01, 0x0000ff);

        // Add the axis lines to the indicator
        this.axisIndicator.add(xArrow);
        this.axisIndicator.add(yArrow);
        this.axisIndicator.add(zArrow);

        //this.axisIndicator.position.set(0.9, 0.9, 0);
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100000)
        this.instance.position.set(10, 10, 10)
        this.scene.add(this.instance)
    }
    
    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true

        if (this.experience.playing){
            this.controls.enablePan = false
            this.controls.enableZoom = false
            this.controls.maxPolarAngle = Math.PI/2; 

        }
    }

    updateCameraTarget(moveX, moveZ) {
        // move camera
        this.instance.position.x += moveX
        this.instance.position.z += moveZ

        // update camera target
        this.cameraTarget.x = this.player.position.x
        this.cameraTarget.y = this.player.position.y + 2
        this.cameraTarget.z = this.player.position.z
        this.controls.target = this.cameraTarget
    }

    // when size of the screen changes, this function is triggered
    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        this.controls.update()
        if (!this.experience.playing) {
            // Get the camera's forward direction vector
            const cameraDirection = new THREE.Vector3();
            cameraDirection.set( 0, 0, -1 ).applyMatrix4( this.instance.matrixWorld );
            cameraDirection.sub( this.instance.position ).normalize();

            // Position the object a fixed distance in front of the camera
            const distance = 0.2;

            const viewSize = this.calculateViewSize(distance)
            const pixelInUnits = viewSize.width*80/this.sizes.width

            const offset = new THREE.Vector3(viewSize.width/2 - pixelInUnits,viewSize.height/2 - pixelInUnits,0);
            offset.applyQuaternion(this.instance.quaternion);

            this.axisIndicator.position.copy(cameraDirection).multiplyScalar(distance).add(this.instance.position).add(offset);

        }
    }

    calculateViewSize(distance) {
        // convert fov from degrees to radians
        let fov = this.instance.fov * (Math.PI / 180);
        const height = 2 * Math.tan(fov / 2) * distance;
        const width = height * this.instance.aspect;
        return { width, height };
    }
}