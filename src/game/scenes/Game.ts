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
    zoomInKey!: Phaser.Input.Keyboard.Key
    zoomOutKey!: Phaser.Input.Keyboard.Key
    zoomInKeyQ!: Phaser.Input.Keyboard.Key
    zoomOutKeyE!: Phaser.Input.Keyboard.Key

    layer: Phaser.Tilemaps.TilemapLayer
    layer2: Phaser.Tilemaps.TilemapLayer

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

        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        this.camera = this.cameras.main;
        this.camera.setZoom(4);
        this.camera.setBounds(0, 0, mapWidth, mapHeight);

        this.createAnimations();
        this.setupPlayer();
        this.setupDebugText();
        this.setupTilemap()
        this.setupNPCs()
        this.setupInputs();

        this.physics.add.collider(this.player, this.layer);
        this.physics.add.collider(this.player, this.layer2);
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

        this.camera.startFollow(this.player, true);
        this.player.play("idle");
    }

    setupInputs()
    {
        this.cursors = this.input.keyboard!.createCursorKeys();

        this.wasd = {
            up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.debugKey.on('down', this.toggleDebug, this);

        this.zoomInKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS);
        this.zoomOutKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);
        
        
        this.zoomInKeyQ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.zoomOutKeyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.escapeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)!;

        this.escapeKey.on('down', () => {
            if (!this.scene.isPaused()) {
                this.scene.pause(); 
                this.scene.launch('ControlsScene'); 
                
                this.input.enabled = false;
            }
        }, this);
    }

    setupTilemap()
    {
        const map = this.make.tilemap({ key: 'level1' });

        const tilesetGrass = map.addTilesetImage('Grass_Middle', 'Grass_Middle.png');
        const tilesetPath = map.addTilesetImage('Path_Middle', 'Path_Middle.png');
        const tilesetWater = map.addTilesetImage('Water_Middle', 'Water_Middle.png');
        const tilesetOak = map.addTilesetImage('Oak_Tree', 'Oak_Tree.png');
        const tilesetHouse = map.addTilesetImage('House1', 'House1.png');
        const tilesetCliff = map.addTilesetImage("Cliff_Tile", "Cliff_Tile.png");
        const tilPath = map.addTilesetImage("Path_Tile", "Path_Tile.png");
        const tilWater = map.addTilesetImage("Water_Tile", "Water_Tile.png");
        const tilBeach = map.addTilesetImage("Beach_Tile", "Beach_Tile.png")

        const tilesets = [tilesetGrass!, tilesetPath!, tilesetWater!, tilPath!, tilesetCliff!, tilWater!, tilBeach!];

        const tils2 = [tilesetOak!, tilesetHouse!];
        this.layer = map.createLayer('Capa de patrones 1', tilesets, 0, 0)!;
        this.layer2 = map.createLayer('Capa de patrones 2', tils2, 0,0)!;

        this.layer.setCollisionByProperty({ collides: true });
        this.layer2.setCollisionByProperty({collides: true});
    }

    setupNPCs() 
    {
        this.minerNpc = this.physics.add.staticSprite(280, 250, 'miner')
            .setDepth(9)
            .play('miner-idle')
            .setInteractive()
            .on('pointerdown', () => this.startDialogue('miner'))

        this.citizenNpc = this.physics.add.staticSprite(1660, 270, 'citizen')
            .setDepth(9) 
            .play('citizen-idle')
            .setInteractive()
            .on('pointerdown', () => this.startDialogue('citizen'))
    }

    setupPlayer()
    {
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

        this.player.setCollideWorldBounds(true);
        this.player.setPosition(100, 384);
        this.player.setDrag(500, 500);
        this.player.setMaxVelocity(this.playerSpeed);
    }

    createAnimations ()
    {
        this.anims.create({
            key: 'miner-idle',
            frames: this.anims.generateFrameNumbers('miner', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'miner-interact',
            frames: this.anims.generateFrameNumbers('miner', { start: 6, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'citizen-idle',
            frames: this.anims.generateFrameNumbers('citizen', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'citizen-interact',
            frames: this.anims.generateFrameNumbers('citizen', { start: 8, end: 17 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'walk_down',
            frames: this.anims.generateFrameNumbers('character', { start: 18, end: 23 }),
            frameRate: 10, 
            repeat: -1 
        });

        this.anims.create({
            key: 'walk_right',
            frames: this.anims.generateFrameNumbers('character', { start: 24, end: 29 }),
            frameRate: 10, 
            repeat: -1 
        });

        this.anims.create({
            key: 'walk_up',
            frames: this.anims.generateFrameNumbers('character', { start: 30, end: 35 }),
            frameRate: 10, 
            repeat: -1 
        });
    }

    setupDebugText()
    {
        this.playerPosText = this.add.text(10, 10, 'Pos: X:0, Y:0', { 
            fontSize: '16px', 
            color: '#ffffff',
            backgroundColor: '#00000080',
            padding: { x: 5, y: 5 }
        });

        this.playerPosText.setScrollFactor(0); 
        this.playerPosText.setDepth(999);
        this.playerPosText.setVisible(false);
    }

    toggleDebug() {
        this.playerPosText.setVisible(!this.playerPosText.visible);
    }

    update() {
        this.handleCameraZoom()
        this.checkNPCInteractions()
        this.handlePlayerMovement()
        this.updateDebugText()
    }

    updateDebugText()
    {
        this.playerPosText.setText(
            `Pos: X:${Math.round(this.player.x)}, Y:${Math.round(this.player.y)}`
        );
    }

    handlePlayerMovement()
    {
        const velocity = new Phaser.Math.Vector2(0, 0);
        let isMoving = false;
        let animKey = 'idle';


        
        if (this.cursors.left.isDown || this.wasd.left.isDown)
        {
            velocity.x = -1;
            this.player.setFlipX(true);
            isMoving = true;
            animKey = 'walk_right';
        }
        if (this.cursors.right.isDown || this.wasd.right.isDown)
        {
            velocity.x = 1;
            this.player.setFlipX(false);
            isMoving = true;
            animKey = 'walk_right';
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown)
        {
            velocity.y = -1;
            isMoving = true;
            animKey = 'walk_up';
        }
        if (this.cursors.down.isDown || this.wasd.down.isDown)
        {
            velocity.y = 1;
            isMoving = true;
            animKey = 'walk_down';
        }
        
        velocity.normalize(); 

        this.player.setVelocity(velocity.x * this.playerSpeed, velocity.y * this.playerSpeed);
        
        if (isMoving) {
            this.player.play(animKey, true);
        } else {
            this.player.play('idle', true);
        }
    }

    handleCameraZoom() {
        const camera = this.cameras.main;
        const zoomSpeed = 0.1; 
        const minZoom = 1;  
        const maxZoom = 3;  

        if (Phaser.Input.Keyboard.JustDown(this.zoomInKey) || Phaser.Input.Keyboard.JustDown(this.zoomInKeyQ)) {
            let newZoom = camera.zoom + zoomSpeed;
            
            if (newZoom > maxZoom) {
                newZoom = maxZoom;
            }
            camera.setZoom(newZoom);
        } 
        
        if (Phaser.Input.Keyboard.JustDown(this.zoomOutKey) || Phaser.Input.Keyboard.JustDown(this.zoomOutKeyE)) {
            let newZoom = camera.zoom - zoomSpeed;
            
            if (newZoom < minZoom) {
                newZoom = minZoom;
            }
            camera.setZoom(newZoom);
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

    checkNPCInteractions()
    {
        const isOverlappingMiner = this.physics.overlap(this.player, this.minerNpc);
        if (this.playerNearMiner && !isOverlappingMiner) {
            this.minerNpc.play('miner-idle', true);
            this.playerNearMiner = false;
        }

        // Lógica para Citizen
        const isOverlappingCitizen = this.physics.overlap(this.player, this.citizenNpc);
        if (this.playerNearCitizen && !isOverlappingCitizen) {
            this.citizenNpc.play('citizen-idle', true);
            this.playerNearCitizen = false;
        }
    }
}
