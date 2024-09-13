'use client'

import React, { useEffect, useRef } from 'react'
import {
  initializeGame,
  performPlayerAction,
  placeBet,
  resolveShowdown,
  startNewHand
} from '@/store/gameSlice'
import { useDispatch, useSelector } from 'react-redux'

import CardStack from '@/components/CardStack'
import ControlBar from '@/components/ControlBar'
import MessageBox from '@/components/MessageBox'
import { RootState } from '@/store'
import { RoundState } from '@/types'
import { setMessageWithExpiration } from '@/store/MessageBox'
import styles from '@/components/GameBoard/GameBoard.module.scss'

const GameBoard: React.FC = () => {
  const initRef = useRef(false)
  const dispatch = useDispatch()
  const { currentRound, currentPlayerIndex, players, currentBet } = useSelector(
    (state: RootState) => state.game
  )

  useEffect(() => {
    if (!initRef.current) {
      dispatch(initializeGame({ playerCount: 2, startingChips: 1000, cardsPerPlayer: 7 }))
      initRef.current = true
    }

    if (
      !players ||
      players.length === 0 ||
      currentPlayerIndex < 0 ||
      currentPlayerIndex >= players.length
    ) {
      console.error('Invalid player state or index:', { players, currentPlayerIndex })
      return // Early return if player state is invalid
    }

    const currentPlayer = players[currentPlayerIndex]

    const handleRoundTransition = () => {
      // Use a guard to ensure actions are dispatched only once per specific conditions
      if (currentRound === RoundState.Ante && currentBet === 0) {
        // Dispatch the ante bet only once
        if (currentPlayer) {
          dispatch(placeBet({ playerId: currentPlayer.id, amount: 1 })) // Example for ante
        }
        return // Avoid further re-renders by early return
      }

      switch (currentRound) {
        case RoundState.FirstBetting:
          // Add a similar guard to ensure message dispatch is controlled

          setMessageWithExpiration({
            message: `First betting round begins. Player ${currentPlayerIndex + 1}'s turn.`,
            type: 'info',
            duration: 5000
          })

          break
        case RoundState.Draw:
          setMessageWithExpiration({
            message: `Draw phase begins. Player ${currentPlayerIndex + 1}, select cards to discard.`,
            type: 'info',
            duration: 5000
          })

          break
        case RoundState.SecondBetting:
          setMessageWithExpiration({
            message: `Second betting round begins. Player ${currentPlayerIndex + 1}'s turn.`,
            type: 'info',
            duration: 5000
          })

          break
        case RoundState.Showdown:
          dispatch(resolveShowdown())

          setMessageWithExpiration({
            message: 'Showdown! Revealing hands...',
            type: 'info',
            duration: 5000
          })

          break
        case RoundState.HandComplete:
          dispatch(startNewHand())

          setMessageWithExpiration({
            message: 'Hand complete. Starting new hand...',
            type: 'info',
            duration: 5000
          })

          break
        default:
          console.warn('Unhandled round state:', currentRound)
      }
    }

    handleRoundTransition()
  }, [currentRound, currentPlayerIndex, currentBet, dispatch, players])

  const onCardDrop = (destinationId: string) => {
    if (players[currentPlayerIndex]) {
      dispatch(
        performPlayerAction({
          playerId: players[currentPlayerIndex].id,
          action: 'drop',
          discardIndices: [0]
        })
      ) // Placeholder
    }
  }

  const onCardDrag = (cardId: string) => {
    console.log(`Card ${cardId} dragged`)
  }

  const handlePlayerAction = (action: PlayerAction, value?: number) => {
    if (players[currentPlayerIndex]) {
      dispatch(performPlayerAction({ playerId: players[currentPlayerIndex].id, action, value }))
    }
  }

  const handleAnteAction = (value: number) => {
    if (players[currentPlayerIndex]) {
      dispatch(placeBet({ playerId: players[currentPlayerIndex].id, amount: value }))
      setMessageWithExpiration({
        message: `Player ${currentPlayerIndex + 1} placed ante.`,
        type: 'info',
        duration: 3000
      })
    }
  }

  const handleDrawSelection = (cardIndices: number[]) => {
    if (players[currentPlayerIndex]) {
      dispatch(
        performPlayerAction({
          playerId: players[currentPlayerIndex].id,
          action: 'draw',
          discardIndices: cardIndices
        })
      )
    }
  }

  return (
    <div className={styles['game-board']}>
      <h2>Current Player: Player {currentPlayerIndex + 1}</h2>
      {players.map((player, index) => (
        <div key={player.id}>
          <h3>
            Player {index + 1} ({player.chips} chips)
          </h3>
          <CardStack
            stack={{
              id: player.id,
              cards: player.hand,
              isHand: true,
              order: 'ascending',
              rules: [],
              layout: {
                name: 'hand',
                description: 'Player hand',
                arrangement: 'spread',
                direction: 'right',
                faceUp: true,
                selectable: true,
                draggable: true
              }
            }}
            onCardDrop={onCardDrop}
            onCardDrag={onCardDrag}
          />
        </div>
      ))}
      <MessageBox />
      <ControlBar
        onPlayerAction={handlePlayerAction}
        onAnteAction={handleAnteAction}
        onDrawSelection={handleDrawSelection}
        currentRound={currentRound}
        currentPlayer={currentPlayerIndex}
        currentBet={currentBet}
      />
    </div>
  )
}

export default GameBoard
