import { GameFactory } from "./infrastructure/factories/gameFactory";
import { WebGameAPI } from "./infrastructure/adapters/webGameAPI";

/**
 * Web Entry Point
 * Inicializa o jogo e expõe a API globalmente para uso no console do navegador
 */

// Cria o jogo
const gameService = GameFactory.createGame();

// Envolve com a API web
const webAPI = new WebGameAPI(gameService);

// Expõe globalmente no window
declare global {
    interface Window {
        rpgt: typeof webAPI;
    }
}

if (typeof globalThis !== "undefined") {
    // Attach to the global object in a platform-agnostic way
    (globalThis as any).rpgt = webAPI;
    
    // Mensagem de boas-vindas
    console.clear();
    console.log("╔════════════════════════════════════════════╗");
    console.log("║     🎮 RPGT - RPG COM CARTAS E TURNOS     ║");
    console.log("╚════════════════════════════════════════════╝\n");
    console.log("Bem-vindo ao jogo!\n");
    console.log("Use 'rpgt.help()' para ver os comandos disponíveis");
    console.log("Use 'rpgt.status()' para ver o estado do jogo\n");
    
    // Mostra o status inicial
    webAPI.printStatus();
}

export { webAPI, gameService };
