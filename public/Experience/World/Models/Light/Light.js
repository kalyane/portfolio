import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'

export default class Light
{
    static type = "light";
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
    }

    setModel()
    {
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

        // Add the light to the scene
        this.scene.add(this.lightSource);
    }

    update()
    {
        // the model copies the modelDragBox position
        this.model.position.copy(this.modelDragBox.position)
        this.model.rotation.copy(this.modelDragBox.rotation)
        this.boxHelper.update()
        // Position the light source at the origin
        this.lightSource.position.copy(this.modelDragBox.position).add(this.offset)
    }

    delete()
    {
        this.scene.remove(this.lightSource)
        this.scene.remove(this.model)
        this.scene.remove(this.modelDragBox)
        this.scene.remove(this.boxHelper)
    }
}