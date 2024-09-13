import { Card, CardStack, GameState, Player, PlayerAction, RoundState } from '@/types';

import { CardDeck } from './deck';
import { findPokerWinner } from '@/utils/gameSlice';

export class FiveCardDrawEngine {
  private players: Player[];
  private dealer: number;
  private currentPlayerIndex: number;
  private pot: number;
  private deck: CardDeck;
  private gameState: GameState;
  private roundState: RoundState;
  private currentBet: number;
  private lastRaiseIndex: number;

  constructor(players: Player[]) {
    if (players.length < 2 || players.length > 10) {
      throw new Error('Invalid number of players. Must be between 2 and 10.');
    }
    this.players = players;
    this.dealer = 0;
    this.currentPlayerIndex = 1; // Start with the player to the left of the dealer
    this.pot = 0;
    this.deck = new CardDeck('main-deck', 'red');
    this.gameState = GameState.NotStarted;
    this.roundState = RoundState.Ante;
    this.currentBet = 0;
    this.lastRaiseIndex = -1;
  }

  public startGame(): void {
    this.gameState = GameState.InProgress;
    this.playHand();
  }

  private playHand(): void {
    this.resetForNewHand();
    this.anteRound();
    this.dealInitialCards();
    this.firstBettingRound();
    if (this.getActivePlayers().length > 1) {
      this.drawRound();
      this.secondBettingRound();
      if (this.getActivePlayers().length > 1) {
        this.showdown();
      }
    }
    this.endHand();
  }

  private resetForNewHand(): void {
    this.deck = new CardDeck('main-deck', 'red');
    this.deck.shuffle();
    this.pot = 0;
    this.currentBet = 0;
    this.lastRaiseIndex = -1;
    this.roundState = RoundState.Ante;
    this.players.forEach(player => {
      player.hand = [];
      player.hasFolded = false;
    });
    this.rotateDealerAndCurrentPlayer();
  }

  private anteRound(): void {
    const anteAmount = 1; // Set your desired ante amount
    this.players.forEach(player => {
      if (player.chips >= anteAmount) {
        player.chips -= anteAmount;
        this.pot += anteAmount;
      } else {
        player.hasFolded = true;
      }
    });
    this.roundState = RoundState.InitialDeal;
  }

  private dealInitialCards(): void {
    for (let i = 0; i < 5; i++) {
      this.players.forEach(player => {
        if (!player.hasFolded) {
          const card = this.deck.drawCard();
          if (card) {
            player.hand.push(card);
          }
        }
      });
    }
    this.roundState = RoundState.FirstBetting;
  }

  private firstBettingRound(): void {
    this.bettingRound();
    this.roundState = RoundState.Draw;
  }

  private drawRound(): void {
    this.players.forEach(player => {
      if (!player.hasFolded) {
        // In a real implementation, we'd need to get the player's discard decision
        // For now, we'll just simulate discarding 0-3 cards randomly
        const discardCount = Math.floor(Math.random() * 4);
        for (let i = 0; i < discardCount; i++) {
          if (player.hand.length > 0) {
            player.hand.pop(); // Discard a card
            const newCard = this.deck.drawCard();
            if (newCard) {
              player.hand.push(newCard);
            }
          }
        }
      }
    });
    this.roundState = RoundState.SecondBetting;
  }

  private secondBettingRound(): void {
    this.bettingRound();
    this.roundState = RoundState.Showdown;
  }

  private showdown(): void {
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length > 1) {
      const playerHands: CardStack[] = activePlayers.map(player => ({
        id: player.id,
        cards: player.hand,
        initialCards: 5,
        order: 'ascending',
        rules: [],
        isHand: true
      }));
      
      const outcome = findPokerWinner(playerHands);
      
      // Distribute the pot to the winner(s)
      const winnerIds = outcome.winners.map(winner => winner.id);
      const winningPlayers = this.players.filter(player => winnerIds.includes(player.id));
      const winAmount = this.pot / winningPlayers.length;
      winningPlayers.forEach(player => {
        player.chips += winAmount;
      });
    } else if (activePlayers.length === 1) {
      // If only one player remains, they win the pot
      activePlayers[0].chips += this.pot;
    }
    this.roundState = RoundState.HandComplete;
  }

  private bettingRound(): void {
    let roundComplete = false;
    this.currentBet = 0;
    this.lastRaiseIndex = -1;

    while (!roundComplete) {
      const currentPlayer = this.players[this.currentPlayerIndex];
      if (!currentPlayer.hasFolded) {
        // In a real implementation, we'd need to get the player's action
        // For now, we'll just simulate a random action
        const action = this.getRandomAction(currentPlayer);
        this.handlePlayerAction(currentPlayer, action);
      }

      if (this.allPlayersActed()) {
        roundComplete = true;
      } else {
        this.moveToNextPlayer();
      }
    }
  }

  private handlePlayerAction(player: Player, action: PlayerAction): void {
    switch (action) {
      case 'fold':
        player.hasFolded = true;
        break;
      case 'check':
        if (this.currentBet > 0) {
          throw new Error('Cannot check when there is a bet');
        }
        break;
      case 'call':
        this.placeBet(player, this.currentBet - this.getPlayerBet(player));
        break;
      case 'bet':
      case 'raise':
        const raiseAmount = this.currentBet + 1; // Minimum raise
        this.placeBet(player, raiseAmount - this.getPlayerBet(player));
        this.currentBet = raiseAmount;
        this.lastRaiseIndex = this.currentPlayerIndex;
        break;
    }
  }

  private placeBet(player: Player, amount: number): void {
    if (player.chips >= amount) {
      player.chips -= amount;
      this.pot += amount;
    } else {
      throw new Error('Not enough chips');
    }
  }

  private getPlayerBet(player: Player): number {
    return this.pot - player.chips;
  }

  private allPlayersActed(): boolean {
    const activePlayers = this.getActivePlayers();
    return activePlayers.length <= 1 || 
           (this.lastRaiseIndex !== -1 && this.currentPlayerIndex === this.lastRaiseIndex);
  }

  private getActivePlayers(): Player[] {
    return this.players.filter(player => !player.hasFolded);
  }

  private moveToNextPlayer(): void {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].hasFolded);
  }

  private rotateDealerAndCurrentPlayer(): void {
    this.dealer = (this.dealer + 1) % this.players.length;
    this.currentPlayerIndex = (this.dealer + 1) % this.players.length;
  }

  private getRandomAction(player: Player): PlayerAction {
    const actions: PlayerAction[] = ['fold', 'check', 'call', 'bet', 'raise'];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private endHand(): void {
    // Reset for the next hand
    this.rotateDealerAndCurrentPlayer();
    if (this.getActivePlayers().length > 1) {
      this.playHand();
    } else {
      this.gameState = GameState.Finished;
    }
  }

  // Getter methods
  public getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getRoundState(): RoundState {
    return this.roundState;
  }
}