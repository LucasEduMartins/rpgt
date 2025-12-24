/**
 * Card Effect - Value Object
 * Define os efeitos que uma carta pode ter
 */
export class CardEffect {
    readonly damage?: number;
    readonly healing?: number;
    readonly defenseBoost?: number;

    constructor(damage?: number, healing?: number, defenseBoost?: number) {
        this.damage = damage;
        this.healing = healing;
        this.defenseBoost = defenseBoost;
    }
}

/**
 * Card Entity
 * Entidade que representa uma carta do jogo
 */
export class Card {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly actionCost: number;
    readonly effect: CardEffect;

    constructor(
        id: string,
        title: string,
        description: string,
        actionCost: number,
        effect: CardEffect
    ) {
        if (actionCost <= 0) {
            throw new Error("Action cost deve ser maior que zero");
        }
        this.id = id;
        this.title = title;
        this.description = description;
        this.actionCost = actionCost;
        this.effect = effect;
    }

    isPlayable(actionsAvailable: number): boolean {
        return this.actionCost <= actionsAvailable;
    }
}
