import type { Card } from "../entities/card";

/**
 * Deck Repository Interface
 * Contrato para gerenciar baralhos
 */
export interface IDeckRepository {
    /**
     * Retorna todas as cartas do baralho
     */
    getCards(): Card[];

    /**
     * Embaralha um array de cartas
     */
    shuffle(cards: Card[]): Card[];

    /**
     * Compra cartas do baralho
     */
    draw(cards: Card[], quantity: number): Card[];
}
