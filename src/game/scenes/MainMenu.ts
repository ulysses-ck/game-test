import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    promptText: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Jugar', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.promptText = this.add.text(512, 600, 'Presiona CUALQUIER tecla o haz clic para empezar', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        
        const startGame = () => {
            
            this.input.keyboard!.off('keydown', startGame);
            this.input.off('pointerdown', startGame);

            this.scene.start('Game');
        };

        
        this.input.keyboard!.on('keydown', startGame);

        
        this.input.on('pointerdown', startGame);

    }
}