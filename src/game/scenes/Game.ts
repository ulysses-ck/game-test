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
    playerPosText!: Phaser.GameObjects.Text;

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

        const newBodyHeight = 70; 
        const originalHeight = this.player.height; 
        
        const offsetY = originalHeight - newBodyHeight; 

        this.player.body!.setSize(
            this.player.width,
            newBodyHeight,    
            false             
        ).setOffset(0, offsetY);

        this.collidableObjects = this.physics.add.staticGroup().setDepth(10);


        this.player.setCollideWorldBounds(true);
        this.player.setPosition(100, 384);
        this.player.setDrag(500, 500);
        this.player.setMaxVelocity(this.playerSpeed);

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.camera.setBounds(0, 0, mapWidth, mapHeight);
        this.camera.startFollow(this.player, true);

        this.playerPosText = this.add.text(10, 10, 'Pos: X:0, Y:0', { 
            fontSize: '16px', 
            color: '#ffffff',
            backgroundColor: '#00000080', // Fondo semi-transparente
            padding: { x: 5, y: 5 }
        });

        this.playerPosText.setScrollFactor(0); 
        this.playerPosText.setDepth(999);

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
        
        const createLargeCollider = (x: number, y: number, frame: string, scale = 1, bodyHeight = 30) => {
            const sprite = this.collidableObjects.create(x, y, 'medieval', frame)
                .setScale(scale)
                .setDepth(COLLISION_DEPTH);
                
            sprite.body.setSize(sprite.width * scale, bodyHeight, true); 
            return sprite;
        };


        this.add.tileSprite(width / 2, height / 2, width, height, 'medieval', 'medievalTile_57.png')
            .setDepth(0); 

        for (let y = 0; y < height; y += 64) {
            this.add.image(1000, y, 'medieval', 'medievalTile_13.png').setDepth(1); 
            this.add.image(1000, y, 'medieval', 'medievalTile_03.png').setDepth(2); 
        }
        
        for (let x = 100; x < 450; x += 64) {
            for (let y = 100; y < 450; y += 64) {
                this.add.image(x, y, 'medieval', 'medievalTile_15.png').setDepth(1);
            }
        }
        
        for (let x = 1400; x < width; x += 64) {
            for (let y = 1000; y < height; y += 64) {
                this.add.image(x, y, 'medieval', 'medievalTile_01.png').setDepth(1);
            }
        }

                
        
        // Tienda (medievalStructure_09.png)
        createLargeCollider(550, 500, 'medievalStructure_09.png', 1.5, 40); 
        
        createLargeCollider(1100, 600, 'medievalStructure_11.png', 1.5, 30); // Edificio pequeño 2

        // Castillo (Dividido en dos partes: superior e inferior)
        createLargeCollider(1300, 324, 'medievalStructure_02.png', 2, 30); // Parte Superior
        createLargeCollider(1300, 400, 'medievalStructure_06.png', 2, 30); // Parte Inferior

        // B. Zona Minera Densa (Colisión)
        this.collidableObjects.create(200, 200, 'medieval', 'medievalEnvironment_12.png').setScale(2).setDepth(COLLISION_DEPTH); // Roca con Hierro
        this.collidableObjects.create(350, 150, 'medieval', 'medievalEnvironment_11.png').setScale(2).setDepth(COLLISION_DEPTH); // Roca con Cobre
        this.collidableObjects.create(150, 350, 'medieval', 'medievalEnvironment_10.png').setScale(1.5).setDepth(COLLISION_DEPTH); // Roca Grande
        
        const forestTrees = [
            {x: 600, y: 1200}, {x: 750, y: 1400}, {x: 100, y: 1100}, {x: 1800, y: 800},
            {x: 1650, y: 1100}, {x: 1450, y: 950}, {x: 1050, y: 1300}, {x: 1900, y: 1300}
        ];

        forestTrees.forEach(pos => {
            const frame = (pos.x % 2 === 0) ? 'medievalEnvironment_04.png' : 'medievalEnvironment_02.png';
            createLargeCollider(pos.x, pos.y, frame, 2.5, 40);
        });
        
        


        const decoSmall = [
            { x: 100, y: 450, frame: 'medievalEnvironment_06.png', scale: 1 },
            { x: 1900, y: 600, frame: 'medievalEnvironment_13.png', scale: 1.5 },
            { x: 1400, y: 50, frame: 'medievalEnvironment_14.png', scale: 1 }, 
            { x: 900, y: 1100, frame: 'medievalEnvironment_07.png', scale: 1.5 },
            { x: 100, y: 1400, frame: 'medievalEnvironment_15.png', scale: 1 },
            { x: 1750, y: 100, frame: 'medievalEnvironment_01.png', scale: 1.5 },
            { x: 1600, y: 200, frame: 'medievalEnvironment_01.png', scale: 1.5 },
            { x: 50, y: 800, frame: 'medievalEnvironment_01.png', scale: 1.5 },
        ];

        decoSmall.forEach(d => {
            this.add.image(d.x, d.y, 'medieval', d.frame)
                .setScale(d.scale)
                .setDepth(DECORATION_DEPTH);
        });
    }

    update () {
        const velocity = new Phaser.Math.Vector2(0, 0);
        let isMoving = false;

        this.playerPosText.setText(
            `Pos: X:${Math.round(this.player.x)}, Y:${Math.round(this.player.y)}`
        );

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
