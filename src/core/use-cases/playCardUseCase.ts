import type { Card } from "../entities/card";
import type { Player } from "../entities/player";
import type { Enemy } from "../entities/enemy";
import type { IHandManager } from "../interfaces/iHandManager";
import { ApplyCardEffectUseCase } from "./applyCardEffectUseCase";

/**
 * Play Card Use Case
 * Responsável por processar o ato de jogar uma carta
 */
export class PlayCardUseCase {
    constructor(private applyCardEffectUseCase: ApplyCardEffectUseCase) {}

    execute(
        cardIndex: number,
        hand: IHandManager,
        player: Player,
        enemy: Enemy,
        actionsRemaining: number,
        discardPile: Card[]
    ): { success: boolean; newActionsRemaining: number } {
        const card = hand.getCard(cardIndex);

        if (!card) {
            return { success: false, newActionsRemaining: actionsRemaining };
        }

        // Verifica se tem ações suficientes
        if (actionsRemaining < card.actionCost) {
            return { success: false, newActionsRemaining: actionsRemaining };
        }

        // Remove da mão e descarta
        const removed = hand.removeCard(cardIndex);
        if (removed) {
            discardPile.push(removed);
        }

        // Reduz ações
        const newActionsRemaining = actionsRemaining - card.actionCost;

        // Aplica efeito
        this.applyCardEffectUseCase.execute(card, player, enemy, hand);

        return { success: true, newActionsRemaining };
    }
}
