import { GameState, PlayerAction, RoundState } from '@/types'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { CardDeck } from '@/types/CardDeck'
import PokerHandEvaluator from '@/utils/HandEvaluator'
import { setMessageWithExpiration } from './MessageBox'
import { v4 as uuidv4 } from 'uuid'

const MAX_CARDS_TO_DISCARD = 3 // Configurable limit for card discards

const initialState: GameState = {
  players: [],
  currentPlayerIndex: 0, // Set to 0 to ensure valid index on initialization
  pot: 0,
  deck: [], // Using an array to represent the deck
  referenceDeck: [], // Reference deck for reshuffling
  roundState: RoundState.Ante,
  currentBet: 0,
  lastRaiseIndex: -1,
  outcome: null,
  message: null,
  history: [],
  currentTurn: 0,
  selectedCardId: null,
  destinationStackId: null,
  currentRound: RoundState.Ante
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Updated initializeGame function in gameSlice
    initializeGame: (
      state,
      action: PayloadAction<{ playerCount: number; startingChips: number; cardsPerPlayer?: number }>
    ) => {
      const { playerCount, startingChips, cardsPerPlayer = 7 } = action.payload // Default to 7 cards per player
      state.players = Array.from({ length: playerCount }, (_, index) => ({
        id: `player-${index + 1}`,
        name: `Player ${index + 1}`,
        chips: startingChips,
        hand: [],
        isDealer: index === 0, // First player is the dealer initially
        hasFolded: false,
        isCurrent: index === 1
      }))
      const deckInstance = new CardDeck(`deck-${uuidv4()}`, 'red')
      deckInstance.shuffle()
      state.deck = deckInstance.getCards()
      state.referenceDeck = deckInstance.getCards()
      state.players.forEach((player, idx) => {
        state.players[idx].hand = [] // Ensure the hand is empty before dealing
        for (let i = 0; i < cardsPerPlayer; i++) {
          const card = state.deck.pop() // Draw a card from the deck
          if (card) {
            state.players[idx].hand.push(card) // Add the card to the player's hand
          }
        }
      })
      setMessageWithExpiration({
        message: 'Game initialized. Ready to play!',
        type: 'info',
        duration: 5000
      })
    },
    toggleCardSelection: (state, action: PayloadAction<{ cardId: string }>) => {
      console.log('Toggling card selection:', action.payload.cardId)
      const cardId = action.payload.cardId
      const card = state.referenceDeck.find((c) => c.id === cardId)
      if (!card) return
      state.referenceDeck[state.referenceDeck.indexOf(card)].isSelected = !card?.isSelected
      console.log(state.referenceDeck)
    },
    placeBet: (state, action: PayloadAction<{ playerId: string; amount: number }>) => {
      const { playerId, amount } = action.payload
      const player = state.players.find((p) => p.id === playerId)
      if (player && player.chips >= amount) {
        player.chips -= amount
        state.pot += amount
        state.currentBet = amount
        state.message = `Player ${player.name} placed a bet of ${amount} chips.`
      } else {
        state.message = `Player ${player?.name} does not have enough chips to place this bet.`
      }
    },
    performPlayerAction: (
      state,
      action: PayloadAction<{
        playerId: string
        action: PlayerAction
        value?: number
        discardIndices?: number[]
      }>
    ) => {
      const { playerId, action: playerAction, discardIndices = [] } = action.payload
      const player = state.players.find((p) => p.id === playerId)
      if (!player) return

      switch (playerAction) {
        case 'fold':
          player.hasFolded = true
          state.message = `Player ${player.name} folded.`
          break
        case 'check':
          if (state.currentBet > 0) {
            state.message = `Player ${player.name} cannot check; there is a current bet.`
          } else {
            state.message = `Player ${player.name} checked.`
          }
          break
        case 'call':
          const callAmount = state.currentBet - (state.pot - player.chips)
          if (player.chips >= callAmount) {
            player.chips -= callAmount
            state.pot += callAmount
            state.message = `Player ${player.name} called the current bet.`
          } else {
            state.message = `Player ${player.name} does not have enough chips to call.`
          }
          break
        case 'bet':
        case 'raise':
          const raiseAmount =
            playerAction === 'bet'
              ? state.currentBet + 1
              : state.currentBet + (action.payload.value || 1)
          if (player.chips >= raiseAmount) {
            player.chips -= raiseAmount
            state.pot += raiseAmount
            state.currentBet = raiseAmount
            state.lastRaiseIndex = state.currentPlayerIndex
            state.message = `Player ${player.name} ${playerAction} by ${raiseAmount} chips.`
          } else {
            state.message = `Player ${player.name} cannot ${playerAction}; insufficient chips.`
          }
          break
        case 'draw':
          if (discardIndices.length > MAX_CARDS_TO_DISCARD) {
            state.message = `Player ${player.name} can only discard up to ${MAX_CARDS_TO_DISCARD} cards.`
          } else {
            discardIndices.forEach((index) => {
              if (index >= 0 && index < player.hand.length) {
                player.hand.splice(index, 1)
                const newCard = state.deck.pop()
                if (newCard) {
                  player.hand.push(newCard)
                }
              }
            })
            state.message = `Player ${player.name} drew ${discardIndices.length} cards.`
          }
          break
      }
      moveToNextPlayer(state)
      const dealer = state.players.find((player) => player.isDealer)
      if (dealer && state.currentPlayerIndex === state.players.indexOf(dealer)) {
        state.roundState = RoundState.SecondBetting
      }
    },
    resolveShowdown: (state) => {
      const activePlayers = state.players.filter((player) => !player.hasFolded)
      if (activePlayers.length > 1) {
        const playerHands = activePlayers.map((player) => ({
          id: player.id,
          cards: player.hand,
          initialCards: 5,
          order: 'ascending',
          rules: [],
          isHand: true
        }))
        const outcome = PokerHandEvaluator.evaluateWinner(playerHands)
        outcome.winners.forEach((winner) => {
          const winningPlayer = state.players.find((p) => p.id === winner.id)
          if (winningPlayer) {
            winningPlayer.chips += state.pot / outcome.winners.length
          }
        })
        state.outcome = outcome
        state.pot = 0
        state.currentBet = 0
        state.roundState = RoundState.HandComplete
        state.message = 'Showdown complete! Winners have been determined.'
      } else if (activePlayers.length === 1) {
        activePlayers[0].chips += state.pot
        state.outcome = {
          winners: [{ id: activePlayers[0].id, cards: activePlayers[0].hand }],
          losers: state.players
            .filter((p) => p.id !== activePlayers[0].id)
            .map((p) => ({ id: p.id, cards: p.hand })),
          handName: 'Last Player Standing',
          handRank: 0,
          hands: [{ id: activePlayers[0].id, cards: activePlayers[0].hand }]
        }
        state.pot = 0
        state.currentBet = 0
        state.roundState = RoundState.HandComplete
        state.message = 'Only one player remains. Pot awarded.'
      }
    }
  }
})

function rotateDealerAndCurrentPlayer(state: GameState): void {
  const currentDealerIndex = state.players.findIndex((player) => player.isDealer)
  if (currentDealerIndex !== -1) {
    state.players[currentDealerIndex].isDealer = false
    const nextDealerIndex = (currentDealerIndex + 1) % state.players.length
    state.players[nextDealerIndex].isDealer = true
    state.currentPlayerIndex = (nextDealerIndex + 1) % state.players.length
  }
}

function moveToNextPlayer(state: GameState): void {
  if (state.players.length > 0) {
    do {
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length
    } while (
      state.players[state.currentPlayerIndex].hasFolded &&
      state.players.some((p) => !p.hasFolded)
    )
  } else {
    state.currentPlayerIndex = 0 // Safe fallback to 0 if players array is empty
  }
}

export const { initializeGame, toggleCardSelection, placeBet, performPlayerAction, resolveShowdown } =
  gameSlice.actions

export default gameSlice.reducer
