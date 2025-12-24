import type { GameState } from "../../core/interfaces/iGameRepository";
import { IGameRepository } from "../../core/interfaces/iGameRepository";

/**
 * Memory Game Repository
 * Implementação em memória do repositório de jogo
 */
export class MemoryGameRepository implements IGameRepository {
    private state: GameState | null = null;

    save(state: GameState): void {
        this.state = state;
    }

    load(): GameState | null {
        return this.state;
    }

    clear(): void {
        this.state = null;
    }
}
