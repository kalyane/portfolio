import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'
import PlayerControl from './PlayerControl.js'
//import {GUI} from 'dat.gui'

export default class Player
{
    static type = "player";
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.life = 100
        this.world = this.experience.world
        this.xp = 0
        this.maxLife = this.life
        this.level = 0
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
        
        // sets previous position for the current one
        this.previousPosition = [new THREE.Vector3().copy(this.modelDragBox.position)]

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

        this.rightHand = this.model.getObjectByName("mixamorigRightHandIndex1")
        this.leftForeArm = this.model.getObjectByName("mixamorigLeftForeArm")

        
    }

    setAnimation(animations)
    {
        // dict of animation
        this.animation = {}
        
        // Mixer
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {} 

        for (var i=0; i < animations.length; i++){
            this.animation.actions[animations[i].name] = this.animation.mixer.clipAction(animations[i])
        }
        
        // initial animation
        this.animation.actions.current = this.animation.actions.Idle
        this.animation.actions.current.play()
    }

    // Play the action
    playAnimation(name)
    {
        const newAction = this.animation.actions[name]
        const oldAction = this.animation.actions.current

        // only change animation if it is different than current
        if (newAction != oldAction){
            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            this.animation.actions.current = newAction
        }
    }

    update()
    {
        if (this.controls) this.controls.update(this.experience.time.delta * 0.001)
        this.model.position.copy(this.modelDragBox.position)
        this.model.rotation.copy(this.modelDragBox.rotation)
        this.boxHelper.update()

        if (this.xp/100 - (this.level/2 * (2 + (this.level-1))) > this.level){
            this.level += 1
            this.life = this.maxLife
        }
    }

    delete()
    {
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
    }

    setControl(){
        this.controls = new PlayerControl(this)
        
    }
}