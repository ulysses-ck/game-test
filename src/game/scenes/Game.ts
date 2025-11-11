import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;

    player: Phaser.Physics.Arcade.Sprite;
    minerNpc!: Phaser.Physics.Arcade.Sprite;
    citizenNpc!: Phaser.Physics.Arcade.Sprite;

    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    playerSpeed = 300;
    collidableObjects: Phaser.Physics.Arcade.StaticGroup;
    playerPosText!: Phaser.GameObjects.Text;
    wasd: {
        up: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    }
    debugKey!: Phaser.Input.Keyboard.Key;
    escapeKey!: Phaser.Input.Keyboard.Key;

    playerNearMiner = false;
    playerNearCitizen = false;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const mapWidth = 2048;
        const mapHeight = 1504;

        // world
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        

        // camera
        this.camera = this.cameras.main;

        // player
        this.player = this.physics.add.sprite(100, 384, 'character'); 
        this.player.setDepth(10);

        const newBodyHeight = 90; 
        const originalHeight = this.player.height; 
        
        const offsetY = originalHeight - newBodyHeight; 

        this.player.body!.setSize(
            this.player.width,
            newBodyHeight,    
            false             
        ).setOffset(0, offsetY);

        const map = this.make.tilemap({ key: 'level1' });

        const tilesetGrass = map.addTilesetImage('Grass_Middle', 'Grass_Middle.png');
        const tilesetPath = map.addTilesetImage('Path_Middle', 'Path_Middle.png');
        const tilesetWater = map.addTilesetImage('Water_Middle', 'Water_Middle.png');

        const tilesets = [tilesetGrass!, tilesetPath!, tilesetWater!];
        const layer = map.createLayer('Capa de patrones 1', tilesets, 0, 0);

        layer!.setCollisionByProperty({ collides: true });

        const debugGraphics = this.add.graphics().setAlpha(0.5);
        map.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });


        this.player.setCollideWorldBounds(true);
        this.player.setPosition(100, 384);
        this.player.setDrag(500, 500);
        this.player.setMaxVelocity(this.playerSpeed);

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.wasd = {
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.debugKey.on('down', this.toggleDebug, this);

        this.escapeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)!;

        this.escapeKey.on('down', () => {
            if (!this.scene.isPaused()) {
                this.scene.pause(); 
                this.scene.launch('ControlsScene'); 
                
                this.input.enabled = false;
            }
        }, this);

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
        this.playerPosText.setVisible(false);

        

        this.physics.add.collider(this.player, layer!);

        this.anims.create({
            key: 'miner-idle',
            frames: [{ key: 'miner', frame: 'idle' }],
            repeat: -1
        });

        this.anims.create({
            key: 'miner-interact',
            frames: [
                { key: 'miner', frame: 'cheer0' },
                { key: 'miner', frame: 'cheer1' } 
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'citizen-idle',
            frames: [{ key: 'citizen', frame: 'idle' }],
            repeat: -1
        });

        this.anims.create({
            key: 'citizen-interact',
            frames: [
                { key: 'citizen', frame: 'think' },
                { key: 'citizen', frame: 'idle' } 
            ],
            frameRate: 4,
            repeat: -1
        });

        this.minerNpc = this.physics.add.staticSprite(280, 200, 'miner')
            .setDepth(9)
            .play('miner-idle')
            .setInteractive()
            .on('pointerdown', () => this.startDialogue('miner'))

        this.citizenNpc = this.physics.add.staticSprite(1200, 380, 'citizen')
            .setDepth(9) 
            .play('citizen-idle')
            .setInteractive()
            .on('pointerdown', () => this.startDialogue('citizen'))

        this.physics.add.overlap(this.player, this.minerNpc, () => { 
            if (!this.playerNearMiner) {
                this.minerNpc.play('miner-interact', true);
                this.playerNearMiner = true;
            }
        }, undefined, this);

        this.physics.add.overlap(this.player, this.citizenNpc, () => {
            if (!this.playerNearCitizen) {
                this.citizenNpc.play('citizen-interact', true);
                this.playerNearCitizen = true;
            }
        }, undefined, this);

        
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

    toggleDebug() {
        this.playerPosText.setVisible(!this.playerPosText.visible);
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
        const isOverlappingMiner = this.physics.overlap(this.player, this.minerNpc);
    
        if (this.playerNearMiner && !isOverlappingMiner) {
            this.minerNpc.play('miner-idle', true);
            this.playerNearMiner = false;
        }

        const isOverlappingCitizen = this.physics.overlap(this.player, this.citizenNpc);
        
        if (this.playerNearCitizen && !isOverlappingCitizen) {
            this.citizenNpc.play('citizen-idle', true);
            this.playerNearCitizen = false;
        }

        const velocity = new Phaser.Math.Vector2(0, 0);
        let isMoving = false;

        this.playerPosText.setText(
            `Pos: X:${Math.round(this.player.x)}, Y:${Math.round(this.player.y)}`
        );

        if (this.cursors.left.isDown || this.wasd.left.isDown)
        {
            velocity.x = -1;
            this.player.setFlipX(true);
            isMoving = true;
        }
        else if (this.cursors.right.isDown || this.wasd.right.isDown)
        {
            velocity.x = 1;
            this.player.setFlipX(false);
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown)
        {
            velocity.y = -1;
            isMoving = true;
        }
        else if (this.cursors.down.isDown || this.wasd.down.isDown)
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

    startDialogue (npcKey: string) {
        this.player.setVelocity(0); 

        const npc = (npcKey === 'miner' ? this.minerNpc : this.citizenNpc);
        npc.play(`${npcKey}-interact`, true);
        
        this.scene.pause(); 
        
        this.scene.launch('DialogueScene', { 
            npc: npcKey, 
            dialogueId: 'intro_01'
        });
    }
}
