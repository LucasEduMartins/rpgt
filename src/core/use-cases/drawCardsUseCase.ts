import type { Card } from "../entities/card";
import type { IHandManager } from "../interfaces/iHandManager";

/**
 * Draw Cards Use Case
 * Responsável por comprar cartas do baralho
 */
export class DrawCardsUseCase {
    execute(
        hand: IHandManager,
        deck: Card[],
        discardPile: Card[],
        quantity: number
    ): void {
        for (let i = 0; i < quantity && deck.length > 0; i++) {
            const card = deck.shift();
            if (card) {
                hand.addCard(card);
            }
        }

        // Se o baralho acabou e há descartadas, reciclar
        if (deck.length === 0 && discardPile.length > 0) {
            const recycled = discardPile.splice(0, discardPile.length);
            deck.push(...this.shuffle(recycled));
        }
    }

    private shuffle(cards: Card[]): Card[] {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
