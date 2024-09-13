// Updated Card.tsx

import { CardClassMap, Card as CardType } from '@/types'
import { useDispatch, useSelector } from 'react-redux'

import Image from 'next/image'
import { RootState } from '@/store'
import { setMessageWithExpiration } from '@/store/MessageBox'
import styles from './Card.module.scss'
import { toggleCardSelection } from '@/store/gameSlice'
import { useDrag } from 'react-dnd'

interface CardProps {
  card: CardType
  onCardDrag: (cardId: string) => void
  draggable?: boolean
  stackId: string
}

const Card: React.FC<CardProps> = ({ card, onCardDrag, draggable, stackId }) => {
  const dispatch = useDispatch()
  const deck = useSelector((state: RootState) => state.game.referenceDeck)

  const isSelected = deck.find((c) => c.id === card.id)?.isSelected || false

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'CARD',
    item: () => {
      onCardDrag(card.id)
      return { cardId: card.id }
    },
    canDrag: draggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const getCardClass = (card: CardType) => {
    const suitClass = styles[`card-${card.suit.toLowerCase()}`]
    const rankClass = styles[`card-${CardClassMap[card.rank]}`]
    const faceClass = card.faceUp ? '' : styles['card-facedown']
    const hoverClass = isDragging ? styles['card-hover'] : styles['card-nohover']
    const selectedClass = isSelected ? styles['selected-card'] : ''
    return `${styles.card} ${suitClass} ${rankClass} ${faceClass} ${hoverClass} ${selectedClass}`
  }

  const handleCardClick = () => {
    if (card.isSelectable) {
      const select = dispatch(toggleCardSelection({ cardId: card.id }))
      if (select && typeof select === 'string') {
        dispatch(
          setMessageWithExpiration({
            message: select,
            type: 'info',
            duration: 10000
          }) as any
        )
      }
    }
  }

  const wrapperClass = isDragging
    ? `${styles['card-wrapper-dragging']} playing-card`
    : `${styles['card-wrapper']} playing-card`

  const CardComponent = () => (
    <div className={getCardClass(card)} onClick={handleCardClick}>
      <span></span>
    </div>
  )

  return draggable ? (
    dragRef(
      <div className={wrapperClass}>
        {card.faceUp ? (
          <Image
            className={getCardClass(card)}
            src={`/images/svg/${CardClassMap[card.rank]}${card.suit.charAt(0).toLowerCase()}.svg`}
            alt={`${card.rank} of ${card.suit}`}
            title={`${card.rank} of ${card.suit}`}
            width={100}
            height={150}
            onClick={handleCardClick}
          />
        ) : (
          <Image
            className={getCardClass(card)}
            src={`/images/svg/b.svg`}
            alt="Card Back"
            width={100}
            height={150}
            onClick={handleCardClick}
          />
        )}
      </div>
    )
  ) : (
    <div className="playing-card" onClick={handleCardClick}>
      {card.faceUp ? (
        <Image
          className={getCardClass(card)}
          src={`/images/svg/${CardClassMap[card.rank]}${card.suit.charAt(0).toLowerCase()}.svg`}
          alt={`${CardClassMap[card.rank]} of ${card.suit.charAt(0).toLowerCase()}`}
          width={100}
          height={150}
        />
      ) : (
        <Image
          className={getCardClass(card)}
          src={`/images/svg/b.svg`}
          alt="Card Back"
          width={100}
          height={150}
        />
      )}
    </div>
  )
}

export default Card
