import type { Card } from "../../core/entities/card";
import type { IHandManager } from "../../core/interfaces/iHandManager";

/**
 * Standard Hand Manager
 * Implementação padrão do gerenciador de mão
 */
export class StandardHandManager implements IHandManager {
    private cards: Card[];

    constructor(initialCards: Card[] = []) {
        this.cards = [...initialCards];
    }

    addCard(card: Card): void {
        this.cards.push(card);
    }

    removeCard(index: number): Card | null {
        if (index < 0 || index >= this.cards.length) {
            return null;
        }
        const [removed] = this.cards.splice(index, 1);
        return removed;
    }

    getCards(): Card[] {
        return [...this.cards];
    }

    getCard(index: number): Card | null {
        if (index < 0 || index >= this.cards.length) {
            return null;
        }
        return this.cards[index];
    }

    getSize(): number {
        return this.cards.length;
    }

    getPlayableCards(actionsAvailable: number): Card[] {
        return this.cards.filter((card) => card.isPlayable(actionsAvailable));
    }

    getPlayableCardIndices(actionsAvailable: number): number[] {
        return this.cards
            .map((card, index) => ({ card, index }))
            .filter(({ card }) => card.isPlayable(actionsAvailable))
            .map(({ index }) => index);
    }

    clear(): void {
        this.cards = [];
    }

    isEmpty(): boolean {
        return this.cards.length === 0;
    }
}
