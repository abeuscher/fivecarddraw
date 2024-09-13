'use client'

import { PlayerAction, RoundState } from '@/types'

import Button from '@/components/Button'
import React from 'react'
import styles from './ControlBar.module.scss'

interface ControlBarProps {
  onPlayerAction: (action: PlayerAction, value?: number) => void
  onAnteAction: (value: number) => void
  onDrawSelection: (cardIndices: number[]) => void
  currentRound: RoundState
  currentPlayer: number
  currentBet: number
}

const ControlBar: React.FC<ControlBarProps> = ({
  onPlayerAction,
  onAnteAction,
  onDrawSelection,
  currentRound,
  currentPlayer,
  currentBet
}) => {
  const handleAction = (action: PlayerAction, value?: number) => {
    if (action === 'ante') {
      onAnteAction(10) // Assuming a fixed ante of 10
    } else {
      onPlayerAction(action, value)
    }
  }

  const renderControls = () => {
    switch (currentRound) {
      case RoundState.Ante:
        return (
          <Button onClick={() => handleAction('ante')} variant="primary">
            Place Ante (10 chips)
          </Button>
        )
      case RoundState.FirstBetting:
      case RoundState.SecondBetting:
        return (
          <>
            {currentBet === 0 && (
              <Button onClick={() => handleAction('check')} variant="secondary">
                Check
              </Button>
            )}
            <Button onClick={() => handleAction('bet', 10)} variant="primary">
              Bet 10
            </Button>
            {currentBet > 0 && (
              <Button onClick={() => handleAction('call')} variant="primary">
                Call
              </Button>
            )}
            <Button onClick={() => handleAction('raise', currentBet * 2)} variant="primary">
              Raise
            </Button>
            <Button onClick={() => handleAction('fold')} variant="danger">
              Fold
            </Button>
          </>
        )
      case RoundState.Draw:
        return (
          <Button onClick={() => onDrawSelection([])} variant="primary">
            Draw Cards
          </Button>
        )
      case RoundState.Showdown:
        return <div>Showdown in progress...</div>
      case RoundState.HandComplete:
        return (
          <Button onClick={() => handleAction('newHand')} variant="primary">
            Next Hand
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className={styles.controlBar}>
      <h3>Player {currentPlayer + 1}'s Turn</h3>
      {renderControls()}
    </div>
  )
}

export default ControlBar
