import { CharacterStats } from "./characterStats";

/**
 * Character Entity - Entidade base
 * Representa um personagem no jogo
 */
export class Character {
    readonly id: string;
    readonly name: string;
    private stats: CharacterStats;

    constructor(id: string, name: string, stats: CharacterStats) {
        this.id = id;
        this.name = name;
        this.stats = stats;
    }

    getStats(): CharacterStats {
        return this.stats;
    }

    setStats(stats: CharacterStats): void {
        this.stats = stats;
    }

    takeDamage(damage: number): void {
        this.stats = this.stats.takeDamage(damage);
    }

    heal(amount: number): void {
        this.stats = this.stats.heal(amount);
    }

    isDefeated(): boolean {
        return this.stats.isDefeated();
    }

    getLife(): number {
        return this.stats.life;
    }

    getAttack(): number {
        return this.stats.attack;
    }

    getDefense(): number {
        return this.stats.defense;
    }
}
