import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'

export default class Modular
{
    static type = "modular";
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
    }

    setModel(receive = false)
    {
        // set shadow property
        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                if (receive){
                    child.receiveShadow = true
                } else{
                    child.castShadow = true
                }
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
    }

    update()
    {
        // the model copies the modelDragBox position
        this.model.position.copy(this.modelDragBox.position)
        this.model.rotation.copy(this.modelDragBox.rotation)
        this.boxHelper.update()

        if (this.separateBoxes){
            for (var i=0; i<this.separateBoxes.length; i++){
                this.separateBoxes[i].position.copy(this.modelDragBox.position)
                this.separateBoxes[i].rotation.copy(this.modelDragBox.rotation)
            }
        }

        if (this.animation){
            this.animation.mixer.update(this.time.delta * 0.001)
        }
    }

    delete()
    {
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
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
        this.animation.actions.current = this.animation.actions[Object.keys(this.animation.actions)[0]]
        this.animation.actions.current.play()
    }
}