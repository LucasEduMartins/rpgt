// Teste simples para validar o jogo funciona
import { GameFactory } from "./dist/infrastructure/factories/gameFactory.js";
import { WebGameAPI } from "./dist/infrastructure/adapters/webGameAPI.js";

console.log("✅ Imports funcionando!");

const gameService = GameFactory.createGame();
const webAPI = new WebGameAPI(gameService);

console.log("\n📊 Status Inicial:");
console.log(webAPI.getStatus());

console.log("\n🎮 Testando comandos:");
console.log("1. Mão atual:", webAPI.getHand().map(c => c.title));
console.log("2. Ajuda:", webAPI.help());
