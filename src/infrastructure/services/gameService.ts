import type { Card } from "../../core/entities/card";
import type { Player } from "../../core/entities/player";
import type { Enemy } from "../../core/entities/enemy";
import type { IHandManager } from "../../core/interfaces/iHandManager";
import type { IGameService, GameState } from "../../core/interfaces/iGameRepository";
import { DrawCardsUseCase } from "../../core/use-cases/drawCardsUseCase";
import { PlayCardUseCase } from "../../core/use-cases/playCardUseCase";
import { EnemyAttackUseCase } from "../../core/use-cases/enemyAttackUseCase";
import { ApplyCardEffectUseCase } from "../../core/use-cases/applyCardEffectUseCase";
import { IDeckRepository } from "../../core/interfaces/iDeckRepository";

/**
 * Game Service
 * Implementação do serviço de jogo que orquestra todos os use-cases
 */
export class GameService implements IGameService {
    private readonly MAX_ACTIONS_PER_TURN = 3;
    private readonly CARD_DRAW_PER_TURN = 2;

    private player: Player;
    private enemy: Enemy;
    private handManager: IHandManager;
    private deck: Card[];
    private discardPile: Card[];
    private currentTurn: number = 1;
    private isPlayerTurn: boolean = true;
    private actionsRemaining: number = this.MAX_ACTIONS_PER_TURN;
    private gameOver: boolean = false;
    private winner?: "player" | "enemy";

    private drawCardsUseCase: DrawCardsUseCase;
    private playCardUseCase: PlayCardUseCase;
    private enemyAttackUseCase: EnemyAttackUseCase;

    constructor(
        player: Player,
        enemy: Enemy,
        handManager: IHandManager,
        deckRepository: IDeckRepository
    ) {
        this.player = player;
        this.enemy = enemy;
        this.handManager = handManager;
        this.deck = deckRepository.shuffle(deckRepository.getCards());
        this.discardPile = [];

        this.drawCardsUseCase = new DrawCardsUseCase();
        this.playCardUseCase = new PlayCardUseCase(new ApplyCardEffectUseCase());
        this.enemyAttackUseCase = new EnemyAttackUseCase();

        this.startTurn();
    }

    /**
     * Inicia um novo turno
     */
    private startTurn(): void {
        if (this.gameOver) return;

        this.actionsRemaining = this.MAX_ACTIONS_PER_TURN;
        this.drawCardsUseCase.execute(
            this.handManager,
            this.deck,
            this.discardPile,
            this.CARD_DRAW_PER_TURN
        );
    }

    /**
     * Jogador joga uma carta
     */
    playCard(cardIndex: number): boolean {
        if (!this.isPlayerTurn || this.gameOver) {
            console.log("Não é o turno do jogador!");
            return false;
        }

        const result = this.playCardUseCase.execute(
            cardIndex,
            this.handManager,
            this.player,
            this.enemy,
            this.actionsRemaining,
            this.discardPile
        );

        if (result.success) {
            this.actionsRemaining = result.newActionsRemaining;

            // Verifica se inimigo foi derrotado
            if (this.enemy.isDefeated()) {
                this.gameOver = true;
                this.winner = "player";
            }

            // Se ações acabaram, passa para o inimigo
            if (this.actionsRemaining === 0 && !this.gameOver) {
                this.finishPlayerTurn();
            }
        }

        return result.success;
    }

    /**
     * Finaliza o turno do jogador
     */
    finishPlayerTurn(): void {
        if (!this.isPlayerTurn || this.gameOver) return;

        this.isPlayerTurn = false;
        this.executeTurnIA();
    }

    /**
     * Executa o turno do inimigo
     */
    private executeTurnIA(): void {
        if (this.isPlayerTurn || this.gameOver) return;

        // Executa o ataque do inimigo
        const playerDefeated = this.enemyAttackUseCase.execute(this.player, this.enemy);

        if (playerDefeated) {
            this.gameOver = true;
            this.winner = "enemy";
            return;
        }

        // Passa para o turno do jogador
        this.isPlayerTurn = true;
        this.currentTurn++;
        this.startTurn();
    }

    /**
     * Retorna o estado atual do jogo
     */
    getState(): GameState {
        return {
            player: this.player,
            enemy: this.enemy,
            currentTurn: this.currentTurn,
            isPlayerTurn: this.isPlayerTurn,
            actionsRemaining: this.actionsRemaining,
            gameOver: this.gameOver,
            winner: this.winner,
        };
    }

    /**
     * Verifica se o jogo acabou
     */
    isGameOver(): boolean {
        return this.gameOver;
    }

    /**
     * Retorna o vencedor
     */
    getWinner(): "player" | "enemy" | undefined {
        return this.winner;
    }

    /**
     * Retorna as cartas na mão
     */
    getHand(): Card[] {
        return this.handManager.getCards();
    }

    /**
     * Retorna informações do turno
     */
    getTurnInfo() {
        return {
            turn: this.currentTurn,
            isPlayerTurn: this.isPlayerTurn,
            actionsRemaining: this.actionsRemaining,
            playerLife: this.player.getLife(),
            enemyLife: this.enemy.getLife(),
            handSize: this.handManager.getSize(),
            gameOver: this.gameOver,
            winner: this.winner,
        };
    }

    /**
     * Retorna cartas jogáveis
     */
    getPlayableCardIndices(): number[] {
        return this.handManager.getPlayableCardIndices(this.actionsRemaining);
    }

    /**
     * Retorna tamanho do baralho
     */
    getDeckSize(): number {
        return this.deck.length;
    }

    /**
     * Retorna tamanho da pilha de descarte
     */
    getDiscardPileSize(): number {
        return this.discardPile.length;
    }
}
