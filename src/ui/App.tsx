import React, { useState, useEffect } from 'react';
import { webAPI } from '../web';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import GameOverModal from './components/GameOverModal';
import './App.css';

export default function App() {
  const [gameState, setGameState] = useState<any>(null);
  const [turnInfo, setTurnInfo] = useState<any>(null);
  const [hand, setHand] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    updateGameState();
    const interval = setInterval(updateGameState, 500);
    return () => clearInterval(interval);
  }, []);

  const updateGameState = () => {
    try {
      const status = webAPI.getStatus();
      const turn = webAPI.getTurnInfo();
      const gameHand = webAPI.getHand ? webAPI.getHand() : [];

      setGameState(status);
      setTurnInfo(turn);
      setHand(gameHand);

      if (webAPI.isGameOver && webAPI.isGameOver()) {
        setGameOver(true);
        setWinner(webAPI.getWinner ? webAPI.getWinner() : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar estado do jogo:', error);
    }
  };

  const playCard = (index: number) => {
    try {
      const success = webAPI.playCard(index);
      if (success) {
        showMessage('✅ Carta jogada com sucesso!', 'success');
      } else {
        showMessage('❌ Não foi possível jogar essa carta.', 'error');
      }
      updateGameState();
    } catch (error) {
      showMessage(`❌ Erro ao jogar carta: ${(error as Error).message}`, 'error');
    }
  };

  const endTurn = () => {
    try {
      webAPI.finishPlayerTurn?.();
      showMessage('➡️ Turno finalizado! Inimigo atacou.', 'info');
      setTimeout(updateGameState, 500);
    } catch (error) {
      showMessage(`❌ Erro ao finalizar turno: ${(error as Error).message}`, 'error');
    }
  };

  const showMessage = (text: string, type: string) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const resetGame = () => {
    window.location.reload();
  };

  if (!gameState) {
    return <div className="loading">Carregando jogo...</div>;
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>🎮 RPGT - RPG com Cartas e Turnos</h1>
        <p className="subtitle">Uma aventura épica baseada em turnos</p>
      </header>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <GameBoard
        gameState={gameState}
        turnInfo={turnInfo}
        hand={hand}
        onPlayCard={playCard}
      />

      <Controls
        onEndTurn={endTurn}
        onRefresh={updateGameState}
        onNewGame={resetGame}
        isPlayerTurn={turnInfo?.isPlayerTurn || false}
        isGameOver={gameOver}
      />

      {gameOver && (
        <GameOverModal
          winner={winner}
          gameState={gameState}
          turnInfo={turnInfo}
          onNewGame={resetGame}
        />
      )}
    </div>
  );
}
