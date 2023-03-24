import * as THREE from '/node_modules/three/build/three.module.js'
import EventEmitter from './Utils/EventEmitter.js'

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'

let instance = null

export default class Experience extends EventEmitter
{
    constructor(_canvas)
    {
        super()
        // Singleton
        if(instance)
        {
            return instance
        }
        instance = this

        this.canvas = _canvas

        this.scene = new THREE.Scene()
        this.time = new Time()
        this.ready = false

        this.messages = []

        this.metrics = {
            time: null,
            life: null,
            defense: null,
            attack: null,
            xp: null,
            level: null,
            over: null,
            key: null
        }
    }

    // set the main attributes that doesn't change when reset
    setAttributes(assets = null, gridSize = {'x':50,'z':50}, playing = false, user_input = true){
        // true if playing, false if editing
        this.playing = playing
        // if user can send keyboard input
        this.user_input = user_input

        this.gridSize = gridSize

        this.resources = new Resources(sources)
        this.world = new World(assets)

        this.scene.background = new THREE.Color(0x78acff);

        let light = new THREE.AmbientLight( 0xf5f3e6 , 1);
        this.scene.add(light);

        if (this.playing){
            this.scene.fog = new THREE.Fog( 0x78acff, 100, 150 );
        }

        let dir_light = new THREE.DirectionalLight( 0xFFFFFF , 1);
        dir_light.position.set(100, 100, 100);
        dir_light.target.position.set(0, 0, 0);
        dir_light.castShadow = true;
        //dir_light.shadowCameraVisible = false;

        let side = 100;
        dir_light.shadow.camera.top = side;
        dir_light.shadow.camera.bottom = -side;
        dir_light.shadow.camera.left = side;
        dir_light.shadow.camera.right = -side;
        this.scene.add(dir_light);

        
        this.sizes = new Sizes(this.canvas)
        
        this.camera = new Camera()
        this.renderer = new Renderer()
        

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })
        
        // Time tick event
        this.time.on('tick', () =>
        {
            this.update()
        })
    }

    cleanScene(){
        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })
    }

    reset(){
        this.trigger("not_ready");
        this.cleanScene()
        this.time.reset()

        this.gameOver = false
        this.metrics.over = ""

        this.world.reset();
        this.ready = true;
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update()
    {
        this.camera.update()
        this.world.update()
        this.renderer.update()
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        instance = null
    }
}