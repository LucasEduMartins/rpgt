import type { IGameService } from "../../core/interfaces/iGameRepository";

/**
 * Web Game API
 * Interface para expor a lógica do jogo no navegador
 */
export class WebGameAPI {
    private game: IGameService;
    private gameHistory: string[] = [];

    constructor(game: IGameService) {
        this.game = game;
        this.logToHistory("🎮 Jogo iniciado!");
    }

    /**
     * Retorna estado atual do jogo
     */
    getStatus() {
        const turnInfo = this.game.getTurnInfo();
        return {
            turn: turnInfo.turn,
            isPlayerTurn: turnInfo.isPlayerTurn,
            actionsRemaining: turnInfo.actionsRemaining,
            playerLife: turnInfo.playerLife,
            enemyLife: turnInfo.enemyLife,
            handSize: turnInfo.handSize,
            gameOver: turnInfo.gameOver,
            winner: turnInfo.winner,
        };
    }

    /**
     * Retorna cartas na mão
     */
    getHand(): Array<{
        index: number;
        id: string;
        title: string;
        actionCost: number;
        description: string;
        playable: boolean;
    }> {
        const hand = this.game.getHand();
        const playableIndices = this.game.getTurnInfo().isPlayerTurn
            ? this.game.getPlayableCardIndices()
            : [];

        return hand.map((card, idx) => ({
            index: idx,
            id: card.id,
            title: card.title,
            actionCost: card.actionCost,
            description: card.description,
            playable: playableIndices.includes(idx),
        }));
    }

    /**
     * Joga uma carta pelo índice
     */
    playCard(cardIndex: number): boolean {
        if (!this.game.getTurnInfo().isPlayerTurn) {
            this.logToHistory("❌ Não é o turno do jogador!");
            return false;
        }

        const hand = this.game.getHand();
        const card = hand[cardIndex];

        if (!card) {
            this.logToHistory(`❌ Carta no índice ${cardIndex} não existe!`);
            return false;
        }

        const success = this.game.playCard(cardIndex);

        if (success) {
            this.logToHistory(
                `✨ Jogou: ${card.title} (custo: ${card.actionCost} ações)`
            );
        } else {
            this.logToHistory(`❌ Não conseguiu jogar ${card.title}`);
        }

        return success;
    }

    /**
     * Finaliza o turno do jogador
     */
    endTurn(): void {
        if (!this.game.getTurnInfo().isPlayerTurn) {
            this.logToHistory("❌ Não é o turno do jogador!");
            return;
        }

        this.logToHistory("⏭️  Turno finalizado");
        this.game.finishPlayerTurn();
        this.logToHistory("👹 Inimigo atacou!");
    }

    /**
     * Retorna histórico de ações
     */
    getHistory(): string[] {
        return [...this.gameHistory];
    }

    /**
     * Limpa histórico
     */
    clearHistory(): void {
        this.gameHistory = [];
    }

    /**
     * Retorna informações do jogador
     */
    getPlayerInfo() {
        const status = this.getStatus();
        return {
            name: "Herói",
            life: status.playerLife,
        };
    }

    /**
     * Retorna informações do inimigo
     */
    getEnemyInfo() {
        const status = this.getStatus();
        return {
            name: "Dragão",
            life: status.enemyLife,
        };
    }

    /**
     * Verifica se o jogo acabou
     */
    isGameOver(): boolean {
        return this.game.getTurnInfo().gameOver;
    }

    /**
     * Retorna o vencedor
     */
    getWinner(): "player" | "enemy" | null {
        const winner = this.game.getTurnInfo().winner;
        return winner || null;
    }

    /**
     * Reseta o jogo (cria novo)
     */
    reset(newGame: IGameService): void {
        this.game = newGame;
        this.gameHistory = [];
        this.logToHistory("🎮 Jogo resetado!");
    }

    /**
     * Printa o status formatado no console
     */
    printStatus(): void {
        const status = this.getStatus();
        const player = this.getPlayerInfo();
        const enemy = this.getEnemyInfo();

        console.clear();
        console.log("╔════════════════════════════════════╗");
        console.log("║   RPGT - RPG COM CARTAS E TURNOS   ║");
        console.log("╚════════════════════════════════════╝\n");

        console.log(`📍 Turno ${status.turn}`);
        console.log(
            `${status.isPlayerTurn ? "👤" : "👹"} Vez: ${status.isPlayerTurn ? "JOGADOR" : "INIMIGO"}\n`
        );

        console.log(`${player.name}     vs     ${enemy.name}`);
        console.log(`❤️  ${player.life}          ❤️  ${enemy.life}\n`);

        if (status.isPlayerTurn) {
            console.log(`⚡ Ações: ${status.actionsRemaining}/${3}`);
            console.log(`🂡 Cartas: ${status.handSize}\n`);

            const hand = this.getHand();
            if (hand.length > 0) {
                console.log("📋 Mão:");
                hand.forEach((card) => {
                    const status = card.playable ? "✅" : "❌";
                    console.log(
                        `  ${status} [${card.index}] ${card.title} (custo: ${card.actionCost})`
                    );
                });
            } else {
                console.log("📋 Sem cartas na mão!");
            }
        }

        if (status.gameOver) {
            console.log("\n");
            console.log("═══════════════════════════════════");
            if (status.winner === "player") {
                console.log("🎉 VITÓRIA! Você venceu!");
            } else {
                console.log("☠️  DERROTA! Você perdeu!");
            }
            console.log("═══════════════════════════════════");
        }

        console.log("\n💡 Use rpgt.help() para ver comandos disponíveis");
    }

    /**
     * Mostra ajuda dos comandos
     */
    help(): void {
        console.clear();
        console.log("╔════════════════════════════════════╗");
        console.log("║         COMANDOS DISPONÍVEIS       ║");
        console.log("╚════════════════════════════════════╝\n");

        console.log("📊 Status do Jogo:");
        console.log("  rpgt.status()           - Mostra estado atual");
        console.log("  rpgt.getHand()          - Lista cartas na mão");
        console.log("  rpgt.getStatus()        - Info em JSON\n");

        console.log("🎮 Ações:");
        console.log("  rpgt.playCard(idx)      - Joga carta no índice");
        console.log("  rpgt.endTurn()          - Finaliza turno\n");

        console.log("👥 Info:");
        console.log("  rpgt.getPlayerInfo()    - Info do jogador");
        console.log("  rpgt.getEnemyInfo()     - Info do inimigo");
        console.log("  rpgt.isGameOver()       - Jogo acabou?");
        console.log("  rpgt.getWinner()        - Quem venceu?\n");

        console.log("📝 Histórico:");
        console.log("  rpgt.getHistory()       - Últimas ações");
        console.log("  rpgt.clearHistory()     - Limpa histórico\n");

        console.log("⚙️  Outros:");
        console.log("  rpgt.help()             - Este menu");
    }

    /**
     * Retorna versão do RPGT
     */
    version(): string {
        return "1.0.0 - BETA";
    }

    /**
     * Log privado
     */
    private logToHistory(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.gameHistory.push(`[${timestamp}] ${message}`);
    }
}
