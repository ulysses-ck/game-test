import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    playerSpeed = 300;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);


        this.player = this.physics.add.sprite(100, 384, 'character'); 
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard!.createCursorKeys();

        
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 36, end: 43 }), 
            frameRate: 10, 
            repeat: -1     
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'character', frame: 0 }], 
            frameRate: 1
        });

        this.player.play("walk")

    }

    update () {
        this.player.setVelocity(0);

        let isMoving = false;

        if (this.cursors.left.isDown || this.cursors.right.isDown)
        {
            if (this.cursors.left.isDown)
            {
                this.player.setVelocityX(-this.playerSpeed);
                this.player.setFlipX(true);
            }
            else if (this.cursors.right.isDown)
            {
                this.player.setVelocityX(this.playerSpeed);
                this.player.setFlipX(false);
            }
            
            this.player.play('walk', true);
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.cursors.down.isDown)
        {
            if (this.cursors.up.isDown)
            {
                this.player.setVelocityY(-this.playerSpeed);
            }
            else if (this.cursors.down.isDown)
            {
                this.player.setVelocityY(this.playerSpeed);
            }
            
            if (!isMoving) {
                this.player.play('walk', true);
                isMoving = true;
            }
        }

        if (!isMoving) {
            this.player.play('idle', true);
        }
    }
}
