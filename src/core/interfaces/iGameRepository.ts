import type { Player } from "../entities/player";
import type { Enemy } from "../entities/enemy";
import type { Card } from "../entities/card";

/**
 * Game State - Aggregate Root
 * Representa o estado imutável do jogo em um momento específico
 */
export interface GameState {
    player: Player;
    enemy: Enemy;
    currentTurn: number;
    isPlayerTurn: boolean;
    actionsRemaining: number;
    gameOver: boolean;
    winner?: "player" | "enemy";
}

/**
 * Game Repository Interface
 * Contrato para persistência e recuperação do estado do jogo
 */
export interface IGameRepository {
    /**
     * Salva o estado atual do jogo
     */
    save(state: GameState): void;

    /**
     * Carrega o último estado do jogo
     */
    load(): GameState | null;

    /**
     * Limpa o estado salvo
     */
    clear(): void;
}

/**
 * Game Service Interface
 * Orquestrador principal da lógica do jogo
 */
export interface IGameService {
    /**
     * Retorna o estado atual
     */
    getState(): GameState;

    /**
     * Jogador joga uma carta
     */
    playCard(cardIndex: number): boolean;

    /**
     * Finaliza o turno do jogador
     */
    finishPlayerTurn(): void;

    /**
     * Verifica se o jogo acabou
     */
    isGameOver(): boolean;

    /**
     * Retorna o vencedor
     */
    getWinner(): "player" | "enemy" | undefined;

    /**
     * Retorna cartas na mão
     */
    getHand(): Card[];

    /**
     * Retorna informações do turno
     */
    getTurnInfo(): {
        turn: number;
        isPlayerTurn: boolean;
        actionsRemaining: number;
        playerLife: number;
        enemyLife: number;
        handSize: number;
        gameOver: boolean;
        winner?: "player" | "enemy";
    };

    /**
     * Retorna índices das cartas jogáveis
     */
    getPlayableCardIndices(): number[];

    /**
     * Retorna tamanho do baralho
     */
    getDeckSize(): number;

    /**
     * Retorna tamanho da pilha de descarte
     */
    getDiscardPileSize(): number;
}
