import { Character } from "./character";
import { CharacterStats } from "./characterStats";

/**
 * Player Entity
 * Entidade que representa o jogador
 */
export class Player extends Character {
    constructor(id: string, name: string, stats: CharacterStats) {
        super(id, name, stats);
    }

    static create(
        id: string,
        name: string,
        attack: number,
        defense: number,
        life: number
    ): Player {
        const stats = new CharacterStats(attack, defense, life);
        return new Player(id, name, stats);
    }
}
