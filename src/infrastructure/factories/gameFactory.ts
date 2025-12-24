import { Player } from "../../core/entities/player";
import { Enemy } from "../../core/entities/enemy";
import { Card, CardEffect } from "../../core/entities/card";
import { CharacterStats } from "../../core/entities/characterStats";
import { GameService } from "../services/gameService";
import { StandardDeckRepository } from "../persistence/standardDeckRepository";
import { StandardHandManager } from "../persistence/standardHandManager";

/**
 * Game Factory
 * Responsável por criar instâncias do jogo
 */
export class GameFactory {

    static createPlayer(
        id: string = "player-001",
        name: string = "Herói"
    ): Player {
        const stats = new CharacterStats(3, 2, 50);
        return new Player(id, name, stats);
    }

    static createEnemy(
        id: string = "enemy-001",
        name: string = "Dragão"
    ): Enemy {
        const stats = new CharacterStats(4, 1, 40);
        return new Enemy(id, name, stats);
    }

    static createGame(
        player?: Player,
        enemy?: Enemy,
    ): GameService {
        const playerInstance = player || this.createPlayer();
        const enemyInstance = enemy || this.createEnemy();

        // Cria a mão e o jogo
        const gameService = new GameService(
            playerInstance,
            enemyInstance,
            new StandardHandManager([]),
            new StandardDeckRepository()
        );

        return gameService;
    }
}
