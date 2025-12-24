/**
 * Character Stats - Value Object
 * Representa as estatísticas base de um personagem
 */
export class CharacterStats {
    readonly attack: number;
    readonly defense: number;
    readonly life: number;

    constructor(attack: number, defense: number, life: number) {
        if (attack < 0 || defense < 0) {
            throw new Error("Attack e defense devem ser não-negativas");
        }
        if (life < 0) {
            throw new Error("Life não pode ser negativa inicialmente");
        }
        this.attack = attack;
        this.defense = defense;
        this.life = Math.max(0, life); // garante que life seja >= 0
    }

    takeDamage(damage: number): CharacterStats {
        const remainingLife = Math.max(0, this.life - damage);
        return new CharacterStats(this.attack, this.defense, remainingLife);
    }

    heal(amount: number): CharacterStats {
        const newLife = this.life + amount;
        return new CharacterStats(this.attack, this.defense, newLife);
    }

    isDefeated(): boolean {
        return this.life <= 0;
    }
}
