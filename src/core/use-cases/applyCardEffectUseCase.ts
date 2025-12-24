import type { Card } from "../entities/card";
import type { Player } from "../entities/player";
import type { Enemy } from "../entities/enemy";
import type { IHandManager } from "../interfaces/iHandManager";
import { CharacterStats } from "../entities/characterStats";

/**
 * Apply Card Effect Use Case
 * Responsável por aplicar os efeitos de uma carta
 */
export class ApplyCardEffectUseCase {
    execute(
        card: Card,
        attacker: Player,
        defender: Enemy,
        hand: IHandManager
    ): void {
        const { damage = 0, healing = 0, defenseBoost = 0 } = card.effect;

        // Aplicar dano com base no ataque do jogador
        if (damage > 0) {
            const finalDamage = Math.max(
                1,
                damage + attacker.getAttack() - defender.getDefense()
            );
            defender.takeDamage(finalDamage);
        }

        // Aplicar cura
        if (healing > 0) {
            attacker.heal(healing);
        }

        // Aumentar defesa temporariamente (apenas no efeito)
        if (defenseBoost > 0) {
            const currentStats = attacker.getStats();
            const boostedStats = new CharacterStats(
                currentStats.attack,
                currentStats.defense + defenseBoost,
                currentStats.life
            );
            attacker.setStats(boostedStats);
        }
    }
}
