import * as THREE from '/node_modules/three/build/three.module.js'
import Experience from '../../../Experience.js'

/**
 * class used to get keyboard input and translate into the game keys
 */
export default class PlayerControl
{
    constructor(model)
    {
        this.experience = new Experience()
        this.time = this.experience.time
        this.world = this.experience.world

        this.camera = this.experience.camera

        this.rotateQuarternion = new THREE.Quaternion()
        this.walkDirection = new THREE.Vector3()
        this.rotateAngle = new THREE.Vector3(0, 1, 0)

        // constants
        this.fadeDuration = 0.2;
        this.walkVelocity = 15;
        this.rotation = 0.05;

        // use model to change animation
        this.model = model;
        // use modelDragBox to change position
        this.modelDragBox = this.model.modelDragBox;

        // state machine
        // enumeration of all the possible states
        this.states = {
            IDLE: 'IDLE',
            WALKING: 'WALKING',
            JUMPING: 'JUMPING',
            INTERACTING: 'INTERACTING',
            DANCING: 'DANCING',
            TWERKING: 'TWERKING'
        }

        this.isJumping = false
        this.isDancing = false
        this.isTwerking = false
        this.dead = false

        this.currentState =  this.states.IDLE;

        // check if key was pressed or released
        this.keysPressed = {
            'w': false,
            'a': false,
            'd': false,
            ' ': false,
            'e': false,
            'k': false,
            'y': false
        };

        if (this.experience.user_input){
            document.addEventListener('keydown', (event) => {
                this.keysPressed[event.key.toLowerCase()] = true;
            }, false);
    
            document.addEventListener('keyup', (event) => {
                this.keysPressed[event.key.toLowerCase()] = false;
            }, false);
        }

        this.start_angle = 225;
    }

    sendInput(keys){
        for (var i=0; i<keys.length; i++){
            this.keysPressed[keys[i]] = true;
        }

        setTimeout(()=>{
            for (var i=0; i<keys.length; i++){
                this.keysPressed[keys[i]] = false;
            }
        }, 10)
    }

    checkState(){
        // check if player died
        if (this.keysPressed['e']) {
            this.currentState = this.states.INTERACTING;
        } else if (this.keysPressed[' '] || this.isJumping) {
            this.currentState = this.states.JUMPING;
        } else if (this.keysPressed['k'] || this.isDancing) {
            this.currentState = this.states.DANCING;
        } else if (this.keysPressed['y'] || this.isTwerking) {
            this.currentState = this.states.TWERKING;
        } else if (this.keysPressed['w'] || this.keysPressed['s'] || this.keysPressed['a'] || this.keysPressed['d']) {
            this.currentState = this.states.WALKING;
        } else {
            this.currentState = this.states.IDLE;
        }
    }

    stateActions(){
        switch(this.currentState) {
            case this.states.IDLE:
                this.playAnimation(this.model.animation.actions.Idle);
                break;

            case this.states.DANCING:
                var play = this.model.animation.actions.Macarena;
                if (!this.isDancing) {
                    this.jumpStartTime = this.time.current;
                    this.isDancing = true
                }
                var elapsedTime = this.time.current - this.jumpStartTime;
                if (elapsedTime > play._clip.duration/play.timeScale * 1000 && this.isDancing) {
                    play = this.model.animation.actions.Idle;
                    this.isDancing = false
                }
                this.playAnimation(play)
                break;

            case this.states.TWERKING:
                var play = this.model.animation.actions.Twerk;
                if (!this.isTwerking) {
                    this.jumpStartTime = this.time.current;
                    this.isTwerking = true
                }
                var elapsedTime = this.time.current - this.jumpStartTime;
                if (elapsedTime > play._clip.duration/play.timeScale * 1000 && this.isTwerking) {
                    play = this.model.animation.actions.Idle;
                    this.isTwerking = false
                }
                this.playAnimation(play)
                break;

            case this.states.WALKING:
                this.move(this.walkVelocity)
                this.playAnimation(this.model.animation.actions.Walk);
                break;

            case this.states.JUMPING:
                var play = this.model.animation.actions.Jump;
                if (!this.isJumping) {
                    this.jumpStartTime = this.time.current;
                    this.isJumping = true
                }
                var elapsedTime = this.time.current - this.jumpStartTime;
                if (elapsedTime > play._clip.duration/play.timeScale * 1000 && this.isJumping) {
                    //this.endAttack()
                    play = this.model.animation.actions.Idle;
                    this.isJumping = false
                }
                this.playAnimation(play)
                break;

            case this.states.INTERACTING:
                this.playAnimation(this.model.animation.actions.Idle);
                this.interact()
                break;
        }
    }

    rotate(rad){
        //this.modelDragBox.rotateY(rad);
        this.modelDragBox.rotation.y += rad;
        this.start_angle += THREE.MathUtils.radToDeg(-rad);
    }

    interact(){
        const raycaster = new THREE.Raycaster();
        var radius = 2

        for (var i=0; i<this.world.directions.length; i++){
            raycaster.set(this.modelDragBox.position, this.world.directions[i], 0, 10);

            const intersects = raycaster.intersectObjects(this.world.interactableModels);

            // if there is a solid distance less than radius, player can't move
            if (intersects.length > 0 && intersects[0].distance < radius){
                this.world.dictModels[intersects[0].object.userData].interact()
                return;
            }
        }
    }

    endAttack()
    {
        var monster = this.getMonsterColliding();
        if (monster){
            if (this.model.attack_weapon.strength){ 
                this.world.dictModels[monster.userData].life -= this.model.attack_weapon.strength
            }
        }
    }

    getMonsterColliding(){
        const raycaster = new THREE.Raycaster();
        var radius = 4

        for (let i = this.start_angle; i < this.start_angle+90; i += 10) {
            const angle = THREE.MathUtils.degToRad(i);
            const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));

            raycaster.set(this.modelDragBox.position, direction, 0, 10);
            //this.experience.scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 10, 0xff0000))

            const intersects = raycaster.intersectObjects(this.world.monstersModels)

            // if there is a solid distance less than radius, player can't move
            if (intersects.length > 0 && intersects[0].distance < radius){
                return intersects[0].object
            }
        }
        return null
    }

    playAnimation(play){
        if (this.model.animation.actions.current != play) {
            this.model.animation.actions.current.fadeOut(this.fadeDuration);
            play.reset().fadeIn(this.fadeDuration).play();
            this.model.animation.actions.current = play;
        }
    
        this.model.animation.mixer.update(this.delta);
    }

    update(delta) {
        this.delta = delta
        this.checkState()
        this.stateActions()
    }

    move(velocity){
        let box = new THREE.Mesh()
        box.copy(this.modelDragBox);
        // calculate towards camera direction
        var angleYCameraDirection = Math.atan2(
            (this.camera.instance.position.x - this.modelDragBox.position.x), 
            (this.camera.instance.position.z - this.modelDragBox.position.z))
        // diagonal movement angle offset
        var directionOffset = this.directionOffset();
        // rotate model
        this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
        box.quaternion.rotateTowards(this.rotateQuarternion, 0.2);
        // calculate direction
        this.camera.instance.getWorldDirection(this.walkDirection)
        this.walkDirection.y = 0;
        this.walkDirection.normalize();
        this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
        // run/walk velocity
        var velocity = this.model.animation.actions.current == this.model.animation.actions.run_forward ? this.runVelocity : this.walkVelocity;
        // move model & camera
        var moveX = this.walkDirection.x * velocity * this.delta;
        var moveZ = this.walkDirection.z * velocity * this.delta;
        let copyBox = box.clone()
        box.position.x += moveX;
        box.position.z += moveZ;

        // world boundaries
        this.experience.world.checkBoundaries(box)
        let diffX = box.position.x - copyBox.position.x
        let diffZ = box.position.z - copyBox.position.z
        if(this.world.canMove(box)){
            this.modelDragBox.copy(box)
            this.camera.updateCameraTarget(diffX, diffZ);
        }
    }


    directionOffset() {
        var directionOffset = 0 // w

        if (this.keysPressed['w']) {
            if (this.keysPressed['a']) {
                directionOffset = Math.PI / 4 // w+a
            } else if (this.keysPressed['d']) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (this.keysPressed['s']) {
            if (this.keysPressed['a']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (this.keysPressed['d']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (this.keysPressed['a']) {
            directionOffset = Math.PI / 2 // a
        } else if (this.keysPressed['d']) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }
}