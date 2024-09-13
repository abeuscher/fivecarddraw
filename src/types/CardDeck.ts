import { Card, Rank, Suit } from '@/types'

import { v4 as uuidv4 } from 'uuid'

export class CardDeck {
    private _cards: Card[];
  
    constructor(
      public id: string,
      public className: string
    ) {
      const deck = CardDeck.init();
      this._cards = deck.cards;
      this.id = deck.id;
      this.className = deck.className;
    }
  
    public static init(): { id: string, cards: Card[], className: string } {
      const id = `deck-${uuidv4()}`;
      const cards: Card[] = [];
      const className = 'red';
  
      const suits = Object.values(Suit);
      const ranks = Object.values(Rank);
  
      for (const suit of suits) {
        for (const rank of ranks) {
          cards.push({
            id: `${rank}-${suit}-${uuidv4()}`,
            suit,
            rank,
            faceUp: true,
            deckId: id,
            isSelectable: true,
            isSelected: false,
            isDraggable: true
          });
        }
      }
  
      return { id, cards, className };
    }
  
    public shuffle(): void {
      for (let i = this._cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
      }
    }
  
    public getCards(): Card[] {
      return [...this._cards]; // Return a copy to prevent direct manipulation
    }
  
    public drawCard(): Card | undefined {
      return this._cards.length ? this._cards.pop() : undefined;
    }
  
    public addCard(card: Card): void {
      this._cards.push(card);
    }
  
    public get cardCount(): number {
      return this._cards.length;
    }
  }