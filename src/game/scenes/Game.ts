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
        const tilesetOak = map.addTilesetImage('Oak_Tree', 'Oak_Tree.png');
        const tilesetHouse = map.addTilesetImage('House1', 'House1.png');
        const tilesetCliff = map.addTilesetImage("Cliff_Tile", "Cliff_Tile.png");
        const tilPath = map.addTilesetImage("Path_Tile", "Path_Tile.png");
        const tilWater = map.addTilesetImage("Water_Tile", "Water_Tile.png");
        const tilBeach = map.addTilesetImage("Beach_Tile", "Beach_Tile.png")

        const tilesets = [tilesetGrass!, tilesetPath!, tilesetWater!, tilPath!, tilesetCliff!, tilWater!, tilBeach!];
        
        const tils2 = [tilesetOak!, tilesetHouse!];
        const layer = map.createLayer('Capa de patrones 1', tilesets, 0, 0);
        const layer2 = map.createLayer('Capa de patrones 2', tils2, 0,0);

        layer!.setCollisionByProperty({ collides: true });
        layer2!.setCollisionByProperty({collides: true});



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
