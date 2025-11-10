import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    playerSpeed = 300;
    collidableObjects: Phaser.Physics.Arcade.StaticGroup;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const mapWidth = 2000;
        const mapHeight = 1500;

        // world
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        

        // camera
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x35654d);

        // player
        this.player = this.physics.add.sprite(100, 384, 'character'); 
        this.player.setDepth(100);

        this.collidableObjects = this.physics.add.staticGroup().setDepth(10);


        this.player.setCollideWorldBounds(true);
        this.player.setPosition(100, 384);
        this.player.setDrag(500, 500);
        this.player.setMaxVelocity(this.playerSpeed);

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.camera.setBounds(0, 0, mapWidth, mapHeight);
        this.camera.startFollow(this.player, true);

        this.setupSceneObjects(mapWidth, mapHeight);

        this.physics.add.collider(this.player, this.collidableObjects);
        
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

    setupSceneObjects (width: number, height: number): void
    {
        const COLLISION_DEPTH = 10;
        const DECORATION_DEPTH = 5;

        // tile grass
        this.add.tileSprite(width / 2, height / 2, width, height, 'medieval', 'medievalTile_57.png')
            .setDepth(0); 

        // decoration
        const deco = [
            { x: 200, y: 450, frame: 'medievalEnvironment_06.png', scale: 1 }, // Matorral
            { x: 500, y: 800, frame: 'medievalEnvironment_09.png', scale: 2 }, // Piedra (Pequeña)
            { x: 1200, y: 100, frame: 'medievalEnvironment_14.png', scale: 2 }, // Hongo
            { x: 900, y: 1100, frame: 'medievalEnvironment_07.png', scale: 1.5 }, // Piedra
            { x: 1800, y: 300, frame: 'medievalEnvironment_13.png', scale: 2 }, // Tronco
            { x: 100, y: 1400, frame: 'medievalEnvironment_15.png', scale: 1 }, // Piedra
        ];

        deco.forEach(d => {
            this.add.image(d.x, d.y, 'medieval', d.frame)
                .setScale(d.scale)
                .setDepth(DECORATION_DEPTH);
        });


        // objs with colliders
        this.collidableObjects.create(150, 800, 'medieval', 'medievalEnvironment_04.png').setScale(2).setDepth(COLLISION_DEPTH);
        this.collidableObjects.create(400, 1000, 'medieval', 'medievalEnvironment_04.png').setScale(2).setDepth(COLLISION_DEPTH);
        this.collidableObjects.create(800, 50, 'medieval', 'medievalEnvironment_04.png').setScale(1.5).setDepth(COLLISION_DEPTH);
        this.collidableObjects.create(1600, 450, 'medieval', 'medievalEnvironment_04.png').setScale(2).setDepth(COLLISION_DEPTH);

        this.collidableObjects.create(500, 300, 'medieval', 'medievalStructure_14.png').setDepth(COLLISION_DEPTH);
        
        this.collidableObjects.create(1800, 1200, 'medieval', 'medievalStructure_05.png').setScale(2).setDepth(COLLISION_DEPTH);

        this.collidableObjects.create(800, 1300, 'medieval', 'medievalTile_09.png').setDepth(COLLISION_DEPTH);
        this.collidableObjects.create(864, 1300, 'medieval', 'medievalTile_09.png').setDepth(COLLISION_DEPTH);
        this.collidableObjects.create(928, 1300, 'medieval', 'medievalTile_09.png').setDepth(COLLISION_DEPTH);
        this.collidableObjects.create(928, 1250, 'medieval', 'medievalUnit_05.png').setDepth(COLLISION_DEPTH); // Valla
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
