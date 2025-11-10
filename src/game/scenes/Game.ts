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
        const mapWidth = 2000;
        const mapHeight = 1500;

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        


        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.1);



        this.player = this.physics.add.sprite(100, 384, 'character'); 
        this.player.setCollideWorldBounds(true);
        this.player.setPosition(100, 384);
        this.player.setDrag(500, 500);
        this.player.setMaxVelocity(this.playerSpeed);

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.camera.setBounds(0, 0, mapWidth, mapHeight);
        this.camera.startFollow(this.player, true);

        
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

        this.player.play("idle")

    }

    update () {
        const velocity = new Phaser.Math.Vector2(0, 0);
        let isMoving = false;

        if (this.cursors.left.isDown)
        {
            velocity.x = -1;
            this.player.setFlipX(true);
            isMoving = true;
        }
        else if (this.cursors.right.isDown)
        {
            velocity.x = 1;
            this.player.setFlipX(false);
            isMoving = true;
        }

        if (this.cursors.up.isDown)
        {
            velocity.y = -1;
            isMoving = true;
        }
        else if (this.cursors.down.isDown)
        {
            velocity.y = 1;
            isMoving = true;
        }
        
        velocity.normalize(); 

        this.player.setVelocity(velocity.x * this.playerSpeed, velocity.y * this.playerSpeed);
        
        if (isMoving) {
            this.player.play('walk', true);
        } else {
            this.player.play('idle', true);
        }
    }
}
