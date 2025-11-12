import { Scene } from 'phaser';

export class ControlsScene extends Scene
{

    constructor ()
    {
        super('ControlsScene');
    }

    create ()
    {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setInteractive();

        this.add.text(width / 2, height * 0.2, '--- CONTROLES DEL JUEGO ---', { 
            fontSize: '32px', 
            color: '#ffffff' 
        }).setOrigin(0.5);

        const controlText = [
            'Movimiento: Flechas o W A S D',
            'Interacción: Clic en NPC',
            'Minar: H',
            'Cortar: J',
            'Azada: K',
            'Regar: L',
            'Acercar cámara: + o Q',
            'Alejar cámara: - o E',
            'Mostrar posición: P',
            'Salir del Menú: ESC'
        ].join('\n\n');

        this.add.text(width / 2, height * 0.45, controlText, {
            fontSize: '20px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard!.on('keydown-ESC', this.exitMenu, this);
    }
    
    exitMenu()
    {
        this.input.keyboard!.off('keydown-ESC', this.exitMenu, this);

        const gameScene = this.scene.get('Game');

        if (gameScene && gameScene.input) {
            gameScene.input.enabled = true;
        }

        this.scene.stop('ControlsScene'); 
        this.scene.resume('Game');
    }
}