import { GameBoard } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export const BasicLayout: GameBoard = {
  id: `board-${uuidv4()}`,
  slots: [
    {
      id: 'opponent-slot',
      title: 'Opponent',
      stacks: [
        {
          id: 'opponent-hand',
          isHand: true,
          cards: new Array(),
          initialCards: 7,
          order: 'ascending',
          rules: ['BLOCK'],
          layout: {
            name: 'Hand',
            description: 'Left to right',
            arrangement: 'spread',
            direction: 'right',
            faceUp: true,
            selectable: false,
            draggable: false
          }
        }
      ]
    },
    {
      id: 'play-area',
      stacks: [
        {
          id: 'draw-pile',
          isHand: false,
          cards: new Array(),
          initialCards: 29,
          order: 'ascending',
          rules: ['BLOCK'],
          layout: {
            name: 'Stack',
            description: 'Draw Pile',
            arrangement: 'stacked',
            direction: 'down',
            faceUp: false,
            selectable: false,
            draggable: false
          },
        },
        {
          id: 'discard-pile',
          isHand: false,
          cards: new Array(),
          initialCards: 0,
          order: 'ascending',
          rules: ['BLOCK'],
          layout: {
            name: 'Stack',
            description: 'stack',
            arrangement: 'stacked',
            direction: 'up',
            faceUp: true,
            selectable: false,
            draggable: false
          },
        }
      ]
    },
    {
      id: 'player-slot',
      title: 'Player',
      stacks: [
        {
          id: 'player-hand',
          isHand: true,
          cards: new Array(),
          initialCards: 7,
          order: 'ascending',
          rules: ['BLOCK'],
          layout: {
            name: 'Hand',
            description: 'Left to right',
            arrangement: 'spread',
            direction: 'right',
            faceUp: true,
            selectable: true,
            draggable: true
          },
        }
      ]
    }
  ]
}
