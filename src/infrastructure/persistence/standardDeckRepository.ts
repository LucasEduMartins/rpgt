import { Card, CardEffect } from "../../core/entities/card";
import type { IDeckRepository } from "../../core/interfaces/iDeckRepository";

/**
 * Standard Deck Repository
 * Implementação padrão do repositório de baralho
 */
export class StandardDeckRepository implements IDeckRepository {
    getCards(): Card[] {
        return [
            new Card(
                "ataque-leve",
                "Ataque Leve",
                "Ataca o inimigo com um golpe rápido",
                1,
                new CardEffect(5, 0, 0)
            ),
            new Card(
                "ataque-forte",
                "Ataque Forte",
                "Um golpe poderoso que causa muito dano",
                2,
                new CardEffect(15, 0, 0)
            ),
            new Card(
                "cura",
                "Cura",
                "Recupera sua vida",
                1,
                new CardEffect(0, 8, 0)
            ),
            new Card(
                "defesa",
                "Defesa",
                "Aumenta sua defesa temporariamente",
                1,
                new CardEffect(0, 0, 5)
            ),
            new Card(
                "golpe-critico",
                "Golpe Crítico",
                "Um ataque muito poderoso",
                3,
                new CardEffect(25, 0, 0)
            ),
            new Card(
                "ataque-leve-2",
                "Ataque Leve",
                "Ataca o inimigo com um golpe rápido",
                1,
                new CardEffect(5, 0, 0)
            ),
            new Card(
                "ataque-forte-2",
                "Ataque Forte",
                "Um golpe poderoso que causa muito dano",
                2,
                new CardEffect(15, 0, 0)
            ),
            new Card(
                "cura-2",
                "Cura",
                "Recupera sua vida",
                1,
                new CardEffect(0, 8, 0)
            ),
        ];;
    }

    shuffle(cards: Card[]): Card[] {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    draw(cards: Card[], quantity: number): Card[] {
        return cards.slice(0, quantity);
    }
}
