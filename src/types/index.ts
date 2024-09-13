// Enums for suit and rank of playing cards
export enum Suit {
  Spades = 'Spades',
  Hearts = 'Hearts',
  Diamonds = 'Diamonds',
  Clubs = 'Clubs',
}

export enum Rank {
  Ace = 'Ace',
  Two = 'Two',
  Three = 'Three',
  Four = 'Four',
  Five = 'Five',
  Six = 'Six',
  Seven = 'Seven',
  Eight = 'Eight',
  Nine = 'Nine',
  Ten = 'Ten',
  Jack = 'Jack',
  Queen = 'Queen',
  King = 'King',
}

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  deckId: string;
  isSelectable: boolean;
  isSelected: boolean;
  isDraggable: boolean;
}

export const CardClassMap = {
  Ace: 'a',
  Two: '2',
  Three: '3',
  Four: '4',
  Five: '5',
  Six: '6',
  Seven: '7',
  Eight: '8',
  Nine: '9',
  Ten: '10',
  Jack: 'j',
  Queen: 'q',
  King: 'k',
};

export interface CardStackLayout {
  name: string;
  description: string;
  arrangement: 'stacked' | 'spread' | 'fan';
  direction: 'left' | 'right' | 'up' | 'down';
  faceUp: boolean;
  selectable: boolean;
  draggable: boolean;
}

// Interface for a card stack
export interface CardStack {
  id: string;
  cards: Card[];
  initialCards?: number;
  order: 'ascending' | 'descending';
  rules: string[];
  isHand: boolean;
  layout?: CardStackLayout;
}

export enum RoundState {
  Ante,
  InitialDeal,
  FirstBetting,
  Draw,
  SecondBetting,
  Showdown,
  HandComplete,
}

export type PlayerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'draw' | 'drop' | 'ante' | 'newHand';

export interface Player {
  id: string;
  name: string;
  chips: number;
  hand: Card[];
  isDealer: boolean;
  isCurrent: boolean;
  hasFolded: boolean;
}

export interface GameState {
  history: any[];
  deck: Card[];  // Using an array of Cards to represent the deck
  referenceDeck: Card[];  // Reference deck for reshuffling
  currentTurn: number;
  selectedCardId: string | null;
  destinationStackId: string | null;
  lastRaiseIndex: number;
  message: string | null;  // Message field for UI feedback
  pot: number;
  currentBet: number;
  roundState: RoundState;
  currentRound: RoundState;
  currentPlayerIndex: number;
  players: Player[];
  outcome: Outcome | null;
}

export type Outcome = {
  winners: Array<Player>;
  losers: Array<Player>;
  handName: string;
  handRank: number;
  hands: Array<{ id: string; cards: Card[] }>;
};

export interface MessageBox {
  message: string;
  type: 'info' | 'warning' | 'error';
  duration: number;
}
