import {Scene} from "phaser"

interface DialogueData {
    npc: string
    dialogueId: string
}

type TDialogues = { [key: string]: { [key: string]: { text: string, options: { label: string, nextState: string }[] } } }

export class DialogueScene extends Scene {
    private dialogueBox!: Phaser.GameObjects.Rectangle;
    private dialogueText!: Phaser.GameObjects.Text;
    private optionsContainer!: Phaser.GameObjects.Container;
    private currentNPC!: string;
    private DIALOGUES: TDialogues = {
        'miner': {
            'intro_01': {
                text: "¡Ey! Soy un minero. Me preparo para excavar en la roca de cobre. ¿Buscas algo?",
                options: [
                    { label: "1. ¿Qué estás buscando?", nextState: 'miner_quest' },
                    { label: "2. ¿Vendes herramientas?", nextState: 'miner_shop' },
                    { label: "3. Adiós.", nextState: 'exit' }
                ]
            },
            'miner_quest': {
                text: "Busco unas vetas de hierro que un grupo de bandidos me robó. Están al oeste del camino.",
                options: [{ label: "3. Adiós.", nextState: 'exit' }]
            },
            'miner_shop': {
                text: "No vendo nada ahora, tengo la bolsa rota. Vuelve más tarde.",
                options: [{ label: "3. Adiós.", nextState: 'exit' }]
            }
        },
        'citizen': {
            'intro_01': {
                text: "¡Hola! Soy la ciudadana. Es un día tranquilo, ¿no crees?",
                options: [
                    { label: "1. ¿Qué haces por aquí?", nextState: 'citizen_job' },
                    { label: "2. ¿Sabes algo de las ruinas?", nextState: 'citizen_lore' },
                    { label: "3. Adiós.", nextState: 'exit' }
                ]
            },
            'citizen_job': {
                text: "Estoy cosechando algunas bayas para el mercado. La vida del pueblo es sencilla pero honesta.",
                options: [
                    { label: "4. Regresar a opciones principales.", nextState: 'intro_01' },
                    { label: "3. Adiós.", nextState: 'exit' }
                ]
            },
            'citizen_lore': {
                text: "Dicen que las ruinas al norte tienen un secreto antiguo, pero la entrada está sellada por rocas.",
                options: [
                    { label: "4. Regresar a opciones principales.", nextState: 'intro_01' },
                    { label: "3. Adiós.", nextState: 'exit' }
                ]
            }
        }
    };

    constructor ()
    {
        super('DialogueScene');
    }

    create (data: DialogueData)
    {
        this.currentNPC = data.npc;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
            .setInteractive();
        
        
        const boxHeight = 200;
        this.dialogueBox = this.add.rectangle(
            width / 2, 
            height - (boxHeight / 2) - 20, 
            width * 0.9, 
            boxHeight, 
            0x222222 
        ).setStrokeStyle(4, 0xAAAAAA);

        
        this.add.text(width * 0.08, height - boxHeight - 10, 
            `--- ${data.npc.toUpperCase()} ---`, 
            { fontSize: '18px', color: '#ffdd00' }
        );

        const initialDialogue = this.DIALOGUES[data.npc][data.dialogueId];

        this.dialogueText = this.add.text(
            width * 0.08, 
            height - boxHeight + 20, 
            initialDialogue.text, // <--- Carga el texto inicial
            { 
                fontSize: '20px', 
                color: '#ffffff',
                wordWrap: { width: width * 0.85 }
            }
        );
        
        this.optionsContainer = this.add.container(width * 0.08, height - 120);

        // Carga las opciones correspondientes al estado 'intro_01'
        this.loadResponseOptions(initialDialogue.options);
    }

    loadResponseOptions(options: { label: string, nextState: string }[]) {
        this.optionsContainer.removeAll(true);
        let yOffset = 0;

        options.forEach((option, index) => { // <-- Itera sobre la lista de objetos de opción
            const optionText = this.add.text(0, yOffset, option.label, { // <-- Usa label
                fontSize: '18px',
                color: '#88ccff'
            })
            .setInteractive()
            .on('pointerover', () => optionText.setColor('#ffffff'))
            .on('pointerout', () => optionText.setColor('#88ccff'))
            // Pasa el 'nextState' completo a handleResponse
            .on('pointerdown', () => this.handleResponse(option.nextState)); 

            this.optionsContainer.add(optionText);
            yOffset += 25;
        });
    }


    handleResponse(nextStateKey: string) {
        
        if (nextStateKey === 'exit') {
            this.exitDialogue();
            return;
        }
        
        // Carga el nuevo estado del diálogo para el NPC actual
        const newDialogueState = this.DIALOGUES[this.currentNPC][nextStateKey];
        
        // 1. Actualiza el texto
        this.dialogueText.setText(newDialogueState.text);

        // 2. Carga las nuevas opciones de respuesta
        this.loadResponseOptions(newDialogueState.options);
    }
    
    exitDialogue() {
        const gameScene = this.scene.get('Game') as any;
        const npc = (this.currentNPC === 'miner' ? gameScene.minerNpc : gameScene.citizenNpc);

        if (npc) {
            npc.play(`${this.currentNPC}-idle`, true);
        }

        this.scene.stop('DialogueScene');
        this.scene.resume('Game');
    }
}