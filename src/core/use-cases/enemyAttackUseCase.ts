import type { Player } from "../entities/player";
import type { Enemy } from "../entities/enemy";

/**
 * Enemy Attack Use Case
 * Responsável por executar o ataque do inimigo
 */
export class EnemyAttackUseCase {
    execute(player: Player, enemy: Enemy): boolean {
        const damage = Math.max(1, enemy.getAttack() - player.getDefense());
        player.takeDamage(damage);

        return player.isDefeated();
    }
}
