(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Character {
  constructor(id, name, stats) {
    this.id = id;
    this.name = name;
    this.stats = stats;
  }
  getStats() {
    return this.stats;
  }
  setStats(stats) {
    this.stats = stats;
  }
  takeDamage(damage) {
    this.stats = this.stats.takeDamage(damage);
  }
  heal(amount) {
    this.stats = this.stats.heal(amount);
  }
  isDefeated() {
    return this.stats.isDefeated();
  }
  getLife() {
    return this.stats.life;
  }
  getAttack() {
    return this.stats.attack;
  }
  getDefense() {
    return this.stats.defense;
  }
}
class CharacterStats {
  constructor(attack, defense, life) {
    if (attack < 0 || defense < 0) {
      throw new Error("Attack e defense devem ser não-negativas");
    }
    if (life < 0) {
      throw new Error("Life não pode ser negativa inicialmente");
    }
    this.attack = attack;
    this.defense = defense;
    this.life = Math.max(0, life);
  }
  takeDamage(damage) {
    const remainingLife = Math.max(0, this.life - damage);
    return new CharacterStats(this.attack, this.defense, remainingLife);
  }
  heal(amount) {
    const newLife = this.life + amount;
    return new CharacterStats(this.attack, this.defense, newLife);
  }
  isDefeated() {
    return this.life <= 0;
  }
}
class Player extends Character {
  constructor(id, name, stats) {
    super(id, name, stats);
  }
  static create(id, name, attack, defense, life) {
    const stats = new CharacterStats(attack, defense, life);
    return new Player(id, name, stats);
  }
}
class Enemy extends Character {
  constructor(id, name, stats) {
    super(id, name, stats);
  }
  static create(id, name, attack, defense, life) {
    const stats = new CharacterStats(attack, defense, life);
    return new Enemy(id, name, stats);
  }
}
class DrawCardsUseCase {
  execute(hand, deck, discardPile, quantity) {
    for (let i = 0; i < quantity && deck.length > 0; i++) {
      const card = deck.shift();
      if (card) {
        hand.addCard(card);
      }
    }
    if (deck.length === 0 && discardPile.length > 0) {
      const recycled = discardPile.splice(0, discardPile.length);
      deck.push(...this.shuffle(recycled));
    }
  }
  shuffle(cards) {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
class PlayCardUseCase {
  constructor(applyCardEffectUseCase) {
    this.applyCardEffectUseCase = applyCardEffectUseCase;
  }
  execute(cardIndex, hand, player, enemy, actionsRemaining, discardPile) {
    const card = hand.getCard(cardIndex);
    if (!card) {
      return { success: false, newActionsRemaining: actionsRemaining };
    }
    if (actionsRemaining < card.actionCost) {
      return { success: false, newActionsRemaining: actionsRemaining };
    }
    const removed = hand.removeCard(cardIndex);
    if (removed) {
      discardPile.push(removed);
    }
    const newActionsRemaining = actionsRemaining - card.actionCost;
    this.applyCardEffectUseCase.execute(card, player, enemy, hand);
    return { success: true, newActionsRemaining };
  }
}
class EnemyAttackUseCase {
  execute(player, enemy) {
    const damage = Math.max(1, enemy.getAttack() - player.getDefense());
    player.takeDamage(damage);
    return player.isDefeated();
  }
}
class ApplyCardEffectUseCase {
  execute(card, attacker, defender, hand) {
    const { damage = 0, healing = 0, defenseBoost = 0 } = card.effect;
    if (damage > 0) {
      const finalDamage = Math.max(
        1,
        damage + attacker.getAttack() - defender.getDefense()
      );
      defender.takeDamage(finalDamage);
    }
    if (healing > 0) {
      attacker.heal(healing);
    }
    if (defenseBoost > 0) {
      const currentStats = attacker.getStats();
      const boostedStats = new CharacterStats(
        currentStats.attack,
        currentStats.defense + defenseBoost,
        currentStats.life
      );
      attacker.setStats(boostedStats);
    }
  }
}
class GameService {
  constructor(player, enemy, handManager, deckRepository) {
    this.MAX_ACTIONS_PER_TURN = 3;
    this.CARD_DRAW_PER_TURN = 2;
    this.currentTurn = 1;
    this.isPlayerTurn = true;
    this.actionsRemaining = this.MAX_ACTIONS_PER_TURN;
    this.gameOver = false;
    this.player = player;
    this.enemy = enemy;
    this.handManager = handManager;
    this.deck = deckRepository.shuffle(deckRepository.getCards());
    this.discardPile = [];
    this.drawCardsUseCase = new DrawCardsUseCase();
    this.playCardUseCase = new PlayCardUseCase(new ApplyCardEffectUseCase());
    this.enemyAttackUseCase = new EnemyAttackUseCase();
    this.startTurn();
  }
  /**
   * Inicia um novo turno
   */
  startTurn() {
    if (this.gameOver) return;
    this.actionsRemaining = this.MAX_ACTIONS_PER_TURN;
    this.drawCardsUseCase.execute(
      this.handManager,
      this.deck,
      this.discardPile,
      this.CARD_DRAW_PER_TURN
    );
  }
  /**
   * Jogador joga uma carta
   */
  playCard(cardIndex) {
    if (!this.isPlayerTurn || this.gameOver) {
      console.log("Não é o turno do jogador!");
      return false;
    }
    const result = this.playCardUseCase.execute(
      cardIndex,
      this.handManager,
      this.player,
      this.enemy,
      this.actionsRemaining,
      this.discardPile
    );
    if (result.success) {
      this.actionsRemaining = result.newActionsRemaining;
      if (this.enemy.isDefeated()) {
        this.gameOver = true;
        this.winner = "player";
      }
      if (this.actionsRemaining === 0 && !this.gameOver) {
        this.finishPlayerTurn();
      }
    }
    return result.success;
  }
  /**
   * Finaliza o turno do jogador
   */
  finishPlayerTurn() {
    if (!this.isPlayerTurn || this.gameOver) return;
    this.isPlayerTurn = false;
    this.executeTurnIA();
  }
  /**
   * Executa o turno do inimigo
   */
  executeTurnIA() {
    if (this.isPlayerTurn || this.gameOver) return;
    const playerDefeated = this.enemyAttackUseCase.execute(this.player, this.enemy);
    if (playerDefeated) {
      this.gameOver = true;
      this.winner = "enemy";
      return;
    }
    this.isPlayerTurn = true;
    this.currentTurn++;
    this.startTurn();
  }
  /**
   * Retorna o estado atual do jogo
   */
  getState() {
    return {
      player: this.player,
      enemy: this.enemy,
      currentTurn: this.currentTurn,
      isPlayerTurn: this.isPlayerTurn,
      actionsRemaining: this.actionsRemaining,
      gameOver: this.gameOver,
      winner: this.winner
    };
  }
  /**
   * Verifica se o jogo acabou
   */
  isGameOver() {
    return this.gameOver;
  }
  /**
   * Retorna o vencedor
   */
  getWinner() {
    return this.winner;
  }
  /**
   * Retorna as cartas na mão
   */
  getHand() {
    return this.handManager.getCards();
  }
  /**
   * Retorna informações do turno
   */
  getTurnInfo() {
    return {
      turn: this.currentTurn,
      isPlayerTurn: this.isPlayerTurn,
      actionsRemaining: this.actionsRemaining,
      playerLife: this.player.getLife(),
      enemyLife: this.enemy.getLife(),
      handSize: this.handManager.getSize(),
      gameOver: this.gameOver,
      winner: this.winner
    };
  }
  /**
   * Retorna cartas jogáveis
   */
  getPlayableCardIndices() {
    return this.handManager.getPlayableCardIndices(this.actionsRemaining);
  }
  /**
   * Retorna tamanho do baralho
   */
  getDeckSize() {
    return this.deck.length;
  }
  /**
   * Retorna tamanho da pilha de descarte
   */
  getDiscardPileSize() {
    return this.discardPile.length;
  }
}
class CardEffect {
  constructor(damage, healing, defenseBoost) {
    this.damage = damage;
    this.healing = healing;
    this.defenseBoost = defenseBoost;
  }
}
class Card {
  constructor(id, title, description, actionCost, effect) {
    if (actionCost <= 0) {
      throw new Error("Action cost deve ser maior que zero");
    }
    this.id = id;
    this.title = title;
    this.description = description;
    this.actionCost = actionCost;
    this.effect = effect;
  }
  isPlayable(actionsAvailable) {
    return this.actionCost <= actionsAvailable;
  }
}
class StandardDeckRepository {
  getCards() {
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
      )
    ];
  }
  shuffle(cards) {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  draw(cards, quantity) {
    return cards.slice(0, quantity);
  }
}
class StandardHandManager {
  constructor(initialCards = []) {
    this.cards = [...initialCards];
  }
  addCard(card) {
    this.cards.push(card);
  }
  removeCard(index) {
    if (index < 0 || index >= this.cards.length) {
      return null;
    }
    const [removed] = this.cards.splice(index, 1);
    return removed;
  }
  getCards() {
    return [...this.cards];
  }
  getCard(index) {
    if (index < 0 || index >= this.cards.length) {
      return null;
    }
    return this.cards[index];
  }
  getSize() {
    return this.cards.length;
  }
  getPlayableCards(actionsAvailable) {
    return this.cards.filter((card) => card.isPlayable(actionsAvailable));
  }
  getPlayableCardIndices(actionsAvailable) {
    return this.cards.map((card, index) => ({ card, index })).filter(({ card }) => card.isPlayable(actionsAvailable)).map(({ index }) => index);
  }
  clear() {
    this.cards = [];
  }
  isEmpty() {
    return this.cards.length === 0;
  }
}
class GameFactory {
  static createPlayer(id = "player-001", name = "Herói") {
    const stats = new CharacterStats(3, 2, 50);
    return new Player(id, name, stats);
  }
  static createEnemy(id = "enemy-001", name = "Dragão") {
    const stats = new CharacterStats(4, 1, 40);
    return new Enemy(id, name, stats);
  }
  static createGame(player, enemy) {
    const playerInstance = player || this.createPlayer();
    const enemyInstance = enemy || this.createEnemy();
    const gameService2 = new GameService(
      playerInstance,
      enemyInstance,
      new StandardHandManager([]),
      new StandardDeckRepository()
    );
    return gameService2;
  }
}
class WebGameAPI {
  constructor(game) {
    this.gameHistory = [];
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
      winner: turnInfo.winner
    };
  }
  /**
   * Retorna cartas na mão
   */
  getHand() {
    const hand = this.game.getHand();
    const playableIndices = this.game.getTurnInfo().isPlayerTurn ? this.game.getPlayableCardIndices() : [];
    return hand.map((card, idx) => ({
      index: idx,
      id: card.id,
      title: card.title,
      actionCost: card.actionCost,
      description: card.description,
      playable: playableIndices.includes(idx)
    }));
  }
  /**
   * Joga uma carta pelo índice
   */
  playCard(cardIndex) {
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
  endTurn() {
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
  getHistory() {
    return [...this.gameHistory];
  }
  /**
   * Limpa histórico
   */
  clearHistory() {
    this.gameHistory = [];
  }
  /**
   * Retorna informações do jogador
   */
  getPlayerInfo() {
    const status = this.getStatus();
    return {
      name: "Herói",
      life: status.playerLife
    };
  }
  /**
   * Retorna informações do inimigo
   */
  getEnemyInfo() {
    const status = this.getStatus();
    return {
      name: "Dragão",
      life: status.enemyLife
    };
  }
  /**
   * Verifica se o jogo acabou
   */
  isGameOver() {
    return this.game.getTurnInfo().gameOver;
  }
  /**
   * Retorna o vencedor
   */
  getWinner() {
    const winner = this.game.getTurnInfo().winner;
    return winner || null;
  }
  /**
   * Reseta o jogo (cria novo)
   */
  reset(newGame) {
    this.game = newGame;
    this.gameHistory = [];
    this.logToHistory("🎮 Jogo resetado!");
  }
  /**
   * Printa o status formatado no console
   */
  printStatus() {
    const status = this.getStatus();
    const player = this.getPlayerInfo();
    const enemy = this.getEnemyInfo();
    console.clear();
    console.log("╔════════════════════════════════════╗");
    console.log("║   RPGT - RPG COM CARTAS E TURNOS   ║");
    console.log("╚════════════════════════════════════╝\n");
    console.log(`📍 Turno ${status.turn}`);
    console.log(
      `${status.isPlayerTurn ? "👤" : "👹"} Vez: ${status.isPlayerTurn ? "JOGADOR" : "INIMIGO"}
`
    );
    console.log(`${player.name}     vs     ${enemy.name}`);
    console.log(`❤️  ${player.life}          ❤️  ${enemy.life}
`);
    if (status.isPlayerTurn) {
      console.log(`⚡ Ações: ${status.actionsRemaining}/${3}`);
      console.log(`🂡 Cartas: ${status.handSize}
`);
      const hand = this.getHand();
      if (hand.length > 0) {
        console.log("📋 Mão:");
        hand.forEach((card) => {
          const status2 = card.playable ? "✅" : "❌";
          console.log(
            `  ${status2} [${card.index}] ${card.title} (custo: ${card.actionCost})`
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
  help() {
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
  version() {
    return "1.0.0 - BETA";
  }
  /**
   * Log privado
   */
  logToHistory(message) {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    this.gameHistory.push(`[${timestamp}] ${message}`);
  }
}
const gameService = GameFactory.createGame();
const webAPI = new WebGameAPI(gameService);
if (typeof globalThis !== "undefined") {
  globalThis.rpgt = webAPI;
  console.clear();
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     🎮 RPGT - RPG COM CARTAS E TURNOS     ║");
  console.log("╚════════════════════════════════════════════╝\n");
  console.log("Bem-vindo ao jogo!\n");
  console.log("Use 'rpgt.help()' para ver os comandos disponíveis");
  console.log("Use 'rpgt.status()' para ver o estado do jogo\n");
  webAPI.printStatus();
}
console.log("teste", webAPI);
const gameUI = {
  game: webAPI,
  lastMessageTime: 0,
  async updateUI() {
    try {
      const status = window.rpgt.getStatus();
      const turnInfo = window.rpgt.getStatus();
      const hand = window.rpgt.getHand ? window.rpgt.getHand() : [];
      const playerHealth = status.playerLife;
      const playerMaxHealth = 100;
      const playerPercent = playerHealth / playerMaxHealth * 100;
      document.getElementById("playerHealthBar").style.width = playerPercent + "%";
      document.getElementById("playerHealthText").textContent = `${playerHealth}/${playerMaxHealth}`;
      document.getElementById("playerAttack").textContent = "10";
      document.getElementById("playerDefense").textContent = "5";
      const enemyHealth = status.enemyLife;
      const enemyMaxHealth = 50;
      const enemyPercent = enemyHealth / enemyMaxHealth * 100;
      document.getElementById("enemyHealthBar").style.width = enemyPercent + "%";
      document.getElementById("enemyHealthText").textContent = `${enemyHealth}/${enemyMaxHealth}`;
      document.getElementById("enemyAttack").textContent = "8";
      document.getElementById("enemyDefense").textContent = "3";
      document.getElementById("currentTurn").textContent = turnInfo.turn;
      document.getElementById("actionsRemaining").textContent = turnInfo.actionsRemaining;
      this.renderHand(hand, turnInfo.actionsRemaining);
      if (window.rpgt.isGameOver()) {
        this.showGameOver(window.rpgt.getWinner());
      }
      const endTurnBtn = document.getElementById("endTurnBtn");
      endTurnBtn.disabled = !turnInfo.isPlayerTurn || window.rpgt.isGameOver();
    } catch (error) {
      console.error("Erro ao atualizar UI:", error);
    }
  },
  renderHand(cards, actionsRemaining) {
    const container = document.getElementById("handCards");
    container.innerHTML = "";
    console.log("Renderizando mão:", cards, "Ações:", actionsRemaining);
    if (!cards || cards.length === 0) {
      container.innerHTML = '<p style="color: #888; grid-column: 1 / -1;">Nenhuma carta na mão</p>';
      return;
    }
    cards.forEach((card, index) => {
      const canPlay = card.actionCost <= actionsRemaining;
      const cardEl = document.createElement("button");
      cardEl.className = "card";
      cardEl.disabled = !canPlay;
      cardEl.innerHTML = `
                        <div class="card-title">${card.title}</div>
                        <div class="card-effect">${card.description}</div>
                        <div class="card-cost">${card.actionCost} ação(ões)</div>
                    `;
      cardEl.onclick = () => this.playCard(index);
      container.appendChild(cardEl);
    });
  },
  playCard(index) {
    try {
      const success = window.rpgt.playCard(index);
      if (success) {
        this.showMessage("✅ Carta jogada com sucesso!", "success");
      } else {
        this.showMessage("❌ Não foi possível jogar essa carta.", "error");
      }
      this.updateUI();
    } catch (error) {
      this.showMessage("❌ Erro ao jogar carta: " + error.message, "error");
    }
  },
  endTurn() {
    try {
      window.rpgt.endTurn();
      this.showMessage("➡️ Turno finalizado! Inimigo atacou.", "info");
      setTimeout(() => this.updateUI(), 500);
    } catch (error) {
      this.showMessage("❌ Erro ao finalizar turno: " + error.message, "error");
    }
  },
  showMessage(text, type) {
    const container = document.getElementById("messageContainer");
    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.textContent = text;
    container.innerHTML = "";
    container.appendChild(message);
    setTimeout(() => {
      message.style.opacity = "0";
      message.style.transition = "opacity 0.5s";
    }, 3e3);
  },
  showGameOver(winner) {
    const modal = document.getElementById("gameOverModal");
    const title = document.getElementById("gameOverTitle");
    const message = document.getElementById("gameOverMessage");
    const stats = document.getElementById("gameOverStats");
    if (winner === "player") {
      title.textContent = "🎉 Vitória!";
      title.style.color = "#00ff88";
      message.textContent = "Parabéns, você derrotou o Goblin!";
    } else {
      title.textContent = "💀 Derrota!";
      title.style.color = "#ff4444";
      message.textContent = "O Goblin foi mais forte desta vez...";
    }
    const status = window.rpgt.getStatus();
    window.rpgt.getTurnInfo();
    stats.innerHTML = `
                    <div class="stat-line"><strong>Turnos Jogados:</strong> ${status.turn}</div>
                    <div class="stat-line"><strong>Sua Saúde:</strong> ${status.playerLife} HP</div>
                    <div class="stat-line"><strong>Saúde do Inimigo:</strong> ${status.enemyLife} HP</div>
                `;
    modal.classList.add("active");
  }
};
window.gameUI = gameUI;
window.rpgt = webAPI;
gameUI.updateUI();
console.log("✅ Interface gráfica carregada!");
