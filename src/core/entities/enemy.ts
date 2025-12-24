import { Character } from "./character";
import { CharacterStats } from "./characterStats";

/**
 * Enemy Entity
 * Entidade que representa um inimigo
 */
export class Enemy extends Character {
    constructor(id: string, name: string, stats: CharacterStats) {
        super(id, name, stats);
    }

    static create(
        id: string,
        name: string,
        attack: number,
        defense: number,
        life: number
    ): Enemy {
        const stats = new CharacterStats(attack, defense, life);
        return new Enemy(id, name, stats);
    }
}
