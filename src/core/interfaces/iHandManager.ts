import type { Card } from "../entities/card";

/**
 * Hand Manager Interface
 * Contrato para gerenciar a mão do jogador
 */
export interface IHandManager {
    /**
     * Adiciona uma carta à mão
     */
    addCard(card: Card): void;

    /**
     * Remove uma carta da mão pelo índice
     */
    removeCard(index: number): Card | null;

    /**
     * Retorna todas as cartas na mão
     */
    getCards(): Card[];

    /**
     * Retorna uma carta específica pelo índice
     */
    getCard(index: number): Card | null;

    /**
     * Retorna a quantidade de cartas na mão
     */
    getSize(): number;

    /**
     * Filtra cartas que podem ser jogadas com ações disponíveis
     */
    getPlayableCards(actionsAvailable: number): Card[];

    /**
     * Limpa todas as cartas da mão
     */
    clear(): void;

    /**
     * Verifica se a mão está vazia
     */
    isEmpty(): boolean;

    /**
     * Retorna índices das cartas jogáveis
     */
    getPlayableCardIndices(actionsAvailable: number): number[];
}
