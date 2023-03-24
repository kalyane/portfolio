import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'
import {GUI} from 'dat.gui'

export default class Weapon
{
    static type = "weapon";
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.resources = this.experience.resources
        this.time = this.experience.time

        this.attack = false
        this.defense = false

        this.using = false

        this.interactTime = this.time.current
    }

    setModel()
    {
        // set shadow property
        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })

        // creates a box to help positioning when editing
        this.boxHelper = new THREE.BoxHelper(this.modelDragBox, 0xffff00)
        this.boxHelper.visible = false

        // saves an argument referencing the name of the model for easy access later
        this.model.userData = this.unique_name
        this.modelDragBox.userData = this.unique_name
        this.boxHelper.userData = this.unique_name

        // adds objects to the scene
        this.scene.add(this.modelDragBox)
        this.scene.add(this.boxHelper)
        this.scene.add(this.model)

        /*
        const gui = new GUI()
        const cubeFolder = gui.addFolder('Offset Rotation')
        cubeFolder.add(this.offsetRot, 'x', -50, 50)
        cubeFolder.add(this.offsetRot, 'y', -50, 50)
        cubeFolder.add(this.offsetRot, 'z', -50, 50)
        cubeFolder.open()
        const cubeFolder2 = gui.addFolder('Offset Position')
        cubeFolder2.add(this.offsetPos, 'x', -50, 50)
        cubeFolder2.add(this.offsetPos, 'y', -50, 50)
        cubeFolder2.add(this.offsetPos, 'z', -50, 50)
        cubeFolder2.open()
        */
    }

    update()
    {
        if (!this.using){
            // the model copies the modelDragBox position
            this.model.position.copy(this.modelDragBox.position)
            this.model.rotation.copy(this.modelDragBox.rotation)
        }
        
        this.boxHelper.update()
    }

    delete()
    {
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
    }

    interact(){

        if (!this.using && this.time.current - this.interactTime > 100){
            this.interactTime = this.time.current

            this.world.player.useWeapon(this)
        }
    }
}