import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

       this.load.tilemapTiledJSON('level1', 'level1.json');

        this.load.image('Grass_Middle.png', 'Grass_Middle.png');
        this.load.image('Path_Middle.png', 'Path_Middle.png');
        this.load.image('Water_Middle.png', 'Water_Middle.png');
        
        this.load.image('Beach_Tile.png', 'Beach_Tile.png');
        this.load.image('Cliff_Tile.png', 'Cliff_Tile.png');
        this.load.image('Path_Tile.png', 'Path_Tile.png');
        this.load.image('Water_Tile.png', 'Water_Tile.png');
        this.load.image('Oak_Tree.png', 'Oak_Tree.png');
        this.load.image('House1.png', 'House1.png')
        this.load.image('invisible.png', 'invisible.png');

        this.load.image('logo', 'logo.png');
        this.load.spritesheet('character', 'Player.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('char_actions', 'Player_Actions.png',
            {
                frameHeight: 48,
                frameWidth: 48,
            }
        );

        // environment
        this.load.atlasXML('medieval', 'medieval.png', 'medieval.xml');

        // npcs
        this.load.spritesheet('miner', 'Skeleton.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('citizen', 'Slime_Green.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
