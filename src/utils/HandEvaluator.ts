import { Card, CardStack, Outcome, Rank, Suit } from '@/types/'

/**
 * Class for evaluating poker hands and determining winners.
 */
export default class PokerHandEvaluator {
  /**
   * Counts the occurrences of each rank in a hand of cards.
   * @param cards An array of Card objects.
   * @returns A Map with Rank as key and count as value.
   */
  private static countRanks(cards: Card[]): Map<Rank, number> {
    return cards.reduce((counts, card) => {
      counts.set(card.rank, (counts.get(card.rank) || 0) + 1)
      return counts
    }, new Map<Rank, number>())
  }

  /**
   * Checks if the hand contains a flush (5 or more cards of the same suit).
   * @param cards An array of Card objects.
   * @returns True if the hand contains a flush, false otherwise.
   */
  private static isFlush(cards: Card[]): boolean {
    const suitCounts = cards.reduce((counts, card) => {
      counts.set(card.suit, (counts.get(card.suit) || 0) + 1)
      return counts
    }, new Map<Suit, number>())

    return Array.from(suitCounts.values()).some((count) => count >= 5)
  }

  /**
   * Checks if the hand contains a straight (5 consecutive ranks).
   * @param cards An array of Card objects.
   * @returns True if the hand contains a straight, false otherwise.
   */
  private static isStraight(cards: Card[]): boolean {
    const rankValues = {
      [Rank.Two]: 2, [Rank.Three]: 3, [Rank.Four]: 4, [Rank.Five]: 5, [Rank.Six]: 6,
      [Rank.Seven]: 7, [Rank.Eight]: 8, [Rank.Nine]: 9, [Rank.Ten]: 10,
      [Rank.Jack]: 11, [Rank.Queen]: 12, [Rank.King]: 13, [Rank.Ace]: 14
    };
  
    const sortedRanks = cards
      .map(card => rankValues[card.rank])
      .sort((a, b) => a - b);
  
    const uniqueRanks = Array.from(new Set(sortedRanks));
  
    // Check for regular straight
    if (uniqueRanks.length >= 5) {
      for (let i = 0; i <= uniqueRanks.length - 5; i++) {
        if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
          return true;
        }
      }
    }
  
    // Check for Ace-low straight (A, 2, 3, 4, 5)
    if (uniqueRanks.includes(14)) { // 14 is Ace
      const aceLowStraight = [14, 2, 3, 4, 5];
      if (aceLowStraight.every(value => uniqueRanks.includes(value))) {
        return true;
      }
    }
  
    return false;
  }
  
  /**
   * Checks if the hand contains a royal flush.
   * @param cards An array of Card objects.
   * @returns True if the hand contains a royal flush, false otherwise.
   */
  private static isRoyalFlush(cards: Card[]): boolean {
    const royalRanks = [Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace]

    return Object.values(Suit).some((suit) => {
      const sameSuitCards = cards.filter((card) => card.suit === suit)
      return (
        sameSuitCards.length >= 5 &&
        royalRanks.every((rank) => sameSuitCards.some((card) => card.rank === rank))
      )
    })
  }

  /**
   * Checks if the hand contains a straight flush.
   * @param cards An array of Card objects.
   * @returns True if the hand contains a straight flush, false otherwise.
   */
  private static isStraightFlush(cards: Card[]): boolean {
    return this.isFlush(cards) && this.isStraight(cards)
  }

  /**
   * Checks if the hand contains four of a kind.
   * @param cards An array of Card objects.
   * @returns True if the hand contains four of a kind, false otherwise.
   */
  private static isFourOfAKind(cards: Card[]): boolean {
    const rankCounts = this.countRanks(cards)
    return Array.from(rankCounts.values()).includes(4)
  }

  /**
   * Checks if the hand contains a full house.
   * @param cards An array of Card objects.
   * @returns True if the hand contains a full house, false otherwise.
   */
  private static isFullHouse(cards: Card[]): boolean {
    const rankCounts = this.countRanks(cards)
    const counts = Array.from(rankCounts.values())
    return (
      (counts.includes(3) && counts.includes(2)) || counts.filter((count) => count >= 3).length >= 2
    )
  }

  /**
   * Checks if the hand contains three of a kind.
   * @param cards An array of Card objects.
   * @returns True if the hand contains three of a kind, false otherwise.
   */
  private static isThreeOfAKind(cards: Card[]): boolean {
    const rankCounts = this.countRanks(cards)
    return Array.from(rankCounts.values()).includes(3)
  }
  /**
   * Checks if the hand contains two pairs.
   * @param cards An array of Card objects.
   * @returns True if the hand contains two pairs, false otherwise.
   */
  private static isTwoPair(cards: Card[]): boolean {
    const rankCounts = this.countRanks(cards)
    return Array.from(rankCounts.values()).filter((count) => count === 2).length >= 2
  }

  /**
   * Checks if the hand contains one pair.
   * @param cards An array of Card objects.
   * @returns True if the hand contains one pair, false otherwise.
   */
  private static isOnePair(cards: Card[]): boolean {
    const rankCounts = this.countRanks(cards)
    return Array.from(rankCounts.values()).filter((count) => count === 2).length === 1
  }

  /**
   * Checks if the hand is a high card hand.
   * @param cards An array of Card objects.
   * @returns True if the hand doesn't contain any pairs or better, false otherwise.
   */
  private static isHighCard(cards: Card[]): boolean {
    const rankCounts = this.countRanks(cards)
    return Array.from(rankCounts.values()).every((count) => count === 1)
  }

  /**
   * Evaluates a poker hand.
   * @param cards An array of Card objects representing a poker hand.
   * @returns An object containing the name and rank of the hand.
   * @throws Error if the input array has fewer than 5 cards.
   */
  public static evaluateHand(cards: Card[]): { name: string; rank: number } {
    if (cards.length < 5) {
      throw new Error('Hand must contain at least 5 cards')
    }

    const handRankings: Array<{ check: (cards: Card[]) => boolean; name: string; rank: number }> = [
      { check: this.isRoyalFlush, name: 'Royal Flush', rank: 10 },
      { check: this.isStraightFlush, name: 'Straight Flush', rank: 9 },
      { check: this.isFourOfAKind, name: 'Four of a Kind', rank: 8 },
      { check: this.isFullHouse, name: 'Full House', rank: 7 },
      { check: this.isFlush, name: 'Flush', rank: 6 },
      { check: this.isStraight, name: 'Straight', rank: 5 },
      { check: this.isThreeOfAKind, name: 'Three of a Kind', rank: 4 },
      { check: this.isTwoPair, name: 'Two Pair', rank: 3 },
      { check: this.isOnePair, name: 'One Pair', rank: 2 },
      { check: this.isHighCard, name: 'High Card', rank: 1 }
    ]

    for (const { check, name, rank } of handRankings) {
      if (check.call(this, cards)) {
        return { name, rank }
      }
    }

    // This should never happen if all checks are implemented correctly
    throw new Error('Unable to evaluate hand')
  }
  /**
   * Compares two hands of the same type to determine the winner.
   * @param hand1 The first hand to compare.
   * @param hand2 The second hand to compare.
   * @param handType The type of hand (e.g., "One Pair", "Two Pair", etc.).
   * @returns 1 if hand1 wins, -1 if hand2 wins, 0 if it's a true tie.
   */
  private static compareEqualHands(hand1: Card[], hand2: Card[], handType: string): number {
    switch (handType) {
      case 'Royal Flush':
        return this.compareRoyalFlush(hand1, hand2)
      case 'Straight Flush':
        return this.compareStraightFlush(hand1, hand2)
      case 'Four of a Kind':
        return this.compareFourOfAKind(hand1, hand2)
      case 'Full House':
        return this.compareFullHouse(hand1, hand2)
      case 'Flush':
        return this.compareFlush(hand1, hand2)
      case 'Straight':
        return this.compareStraight(hand1, hand2)
      case 'Three of a Kind':
        return this.compareThreeOfAKind(hand1, hand2)
      case 'Two Pair':
        return this.compareTwoPair(hand1, hand2)
      case 'One Pair':
        return this.compareOnePair(hand1, hand2)
      case 'High Card':
        return this.compareHighCard(hand1, hand2)
      default:
        throw new Error(`Unknown hand type: ${handType}`)
    }
  }

  /**
   * Finds N cards of the same rank in a hand.
   * @param hand The hand to search.
   * @param n The number of cards to find (e.g., 2 for a pair, 3 for three of a kind).
   * @returns An array of cards that match the criteria, sorted by rank.
   */
  private static findNOfAKind(hand: Card[], n: number): Card[] {
    const rankCounts = this.countRanks(hand)
    return hand
      .filter((card) => rankCounts.get(card.rank) === n)
      .sort((a, b) => this.compareRanks(b.rank, a.rank)) // Sort in descending order
  }

  private static compareRanks(rank1: Rank, rank2: Rank): number {
    const rankOrder = [...Object.values(Rank)] // Ace high
    rankOrder.push(rankOrder.shift() as Rank)
    const index1 = rankOrder.indexOf(rank1)
    const index2 = rankOrder.indexOf(rank2)
    if (index1 > index2) return 1
    if (index1 < index2) return -1
    return 0
  }

  /**
   * Compares the high cards of two hands.
   * @param hand1 The first hand to compare.
   * @param hand2 The second hand to compare.
   * @returns 1 if hand1 wins, -1 if hand2 wins, 0 if it's a tie.
   */
  private static compareHighCards(hand1: Card[], hand2: Card[]): number {
    for (let i = 0; i < hand1.length; i++) {
      const comparison = this.compareRanks(hand1[i].rank, hand2[i].rank)
      if (comparison !== 0) return comparison
    }
    return 0
  }

  /**
   * Determines the winner among multiple players, breaking ties when necessary.
   * @param players An array of player objects, each containing a player name and hand.
   * @returns An object containing the winners, losers, hand name, and hand rank.
   * @throws Error if no players are provided.
   */
  public static evaluateWinner(players: Array<CardStack>): Outcome {
    if (players.length === 0) {
      throw new Error('At least one player is required')
    }
  
    let winners: Array<CardStack> = [players[0]]
    let losers: Array<CardStack> = []
    let winningHand = this.evaluateHand(players[0].cards)
  
    for (let i = 1; i < players.length; i++) {
      const currentPlayer = players[i]
      const currentHand = this.evaluateHand(currentPlayer.cards)
  
      if (currentHand.rank > winningHand.rank) {
        losers = losers.concat(winners)
        winners = [currentPlayer]
        winningHand = currentHand
      } else if (currentHand.rank === winningHand.rank) {
        const comparison = this.compareEqualHands(
          winners[0].cards,
          currentPlayer.cards,
          winningHand.name
        )
        if (comparison < 0) {
          losers = losers.concat(winners)
          winners = [currentPlayer]
        } else if (comparison === 0) {
          winners.push(currentPlayer)
        } else {
          losers.push(currentPlayer)
        }
      } else {
        losers.push(currentPlayer)
      }
    }
  
    const hands = players.map((player) => {
      const playerHandType = this.evaluateHand(player.cards).name
      return {
        id: player.id,
        cards: this.getBestFiveCardHand(player.cards, playerHandType)
      }
    })
  
    return {
      winners: winners,
      losers: losers,
      handName: winningHand.name,
      handRank: winningHand.rank,
      hands: hands
    }
  }

  private static getBestFiveCardHand(cards: Card[], handType: string): Card[] {
    switch (handType) {
      case 'Royal Flush':
      case 'Straight Flush':
        return this.getBestStraightFlush(cards)
      case 'Four of a Kind':
        return this.getBestFourOfAKind(cards)
      case 'Full House':
        return this.getBestFullHouse(cards)
      case 'Flush':
        return this.getBestFlush(cards)
      case 'Straight':
        return this.getBestStraight(cards)
      case 'Three of a Kind':
        return this.getBestThreeOfAKind(cards)
      case 'Two Pair':
        return this.getBestTwoPair(cards)
      case 'One Pair':
        return this.getBestOnePair(cards)
      case 'High Card':
      default:
        return this.getHighCards(cards, 5)
    }
  }

  private static getBestStraightFlush(cards: Card[]): Card[] {
    const flushSuit = this.getFlushSuit(cards)
    if (!flushSuit) return []
    const flushCards = cards
      .filter((card) => card.suit === flushSuit)
      .sort((a, b) => this.compareRanks(b.rank, a.rank))
    return this.getBestStraight(flushCards).slice(0, 5)
  }
  private static getBestFourOfAKind(cards: Card[]): Card[] {
    const quads = this.findNOfAKind(cards, 4)
    if (quads.length === 0) {
      // If no four of a kind, return the highest 5 cards
      return this.getHighCards(cards, 5)
    }
    const kicker = this.getHighCards(
      cards.filter((card) => card.rank !== quads[0].rank),
      1
    )[0]
    return [...quads, kicker]
  }

  private static getBestFullHouse(cards: Card[]): Card[] {
    const trips = this.findNOfAKind(cards, 3)
    if (trips.length === 0) {
      // If no three of a kind, return the highest 5 cards
      return this.getHighCards(cards, 5)
    }
    const pairs = this.findNOfAKind(
      cards.filter((card) => card.rank !== trips[0].rank),
      2
    )
    if (pairs.length === 0) {
      // If no pair after three of a kind, return the highest 5 cards
      return this.getHighCards(cards, 5)
    }
    return [...trips, ...pairs.slice(0, 2)]
  }

  private static getBestFlush(cards: Card[]): Card[] {
    const flushSuit = this.getFlushSuit(cards)
    if (!flushSuit) return []
    return cards
      .filter((card) => card.suit === flushSuit)
      .sort((a, b) => this.compareRanks(b.rank, a.rank))
      .slice(0, 5)
  }

  private static getBestStraight(cards: Card[]): Card[] {
    const rankValues = {
      [Rank.Two]: 2, [Rank.Three]: 3, [Rank.Four]: 4, [Rank.Five]: 5, [Rank.Six]: 6,
      [Rank.Seven]: 7, [Rank.Eight]: 8, [Rank.Nine]: 9, [Rank.Ten]: 10,
      [Rank.Jack]: 11, [Rank.Queen]: 12, [Rank.King]: 13, [Rank.Ace]: 14
    };
  
    const sortedCards = cards.sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);
    const uniqueRanks = Array.from(new Set(sortedCards.map(card => rankValues[card.rank])));
  
    // Check for regular straight
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
        return sortedCards.filter(card => 
          rankValues[card.rank] <= uniqueRanks[i] && 
          rankValues[card.rank] >= uniqueRanks[i + 4]
        ).slice(0, 5);
      }
    }
  
    // Check for Ace-low straight
    if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && 
        uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
      return [
        ...sortedCards.filter(card => card.rank === Rank.Five),
        ...sortedCards.filter(card => card.rank === Rank.Four),
        ...sortedCards.filter(card => card.rank === Rank.Three),
        ...sortedCards.filter(card => card.rank === Rank.Two),
        ...sortedCards.filter(card => card.rank === Rank.Ace)
      ].slice(0, 5);
    }
  
    return [];
  }

  private static getBestThreeOfAKind(cards: Card[]): Card[] {
    const trips = this.findNOfAKind(cards, 3)
    if (trips.length === 0) {
      return this.getHighCards(cards, 5)
    }
    const kickers = this.getHighCards(
      cards.filter((card) => card.rank !== trips[0].rank),
      2
    )
    return [...trips, ...kickers]
  }

  private static getBestTwoPair(cards: Card[]): Card[] {
    const pairs = this.findNOfAKind(cards, 2).sort((a, b) => this.compareRanks(b.rank, a.rank))

    if (pairs.length < 2) {
      return this.getHighCards(cards, 5)
    }

    const bestPairs = pairs.slice(0, 2).flat()
    const kickers = this.getHighCards(
      cards.filter((card) => !bestPairs.some((pairCard) => pairCard.rank === card.rank)),
      5 - bestPairs.length
    )

    return [...bestPairs, ...kickers].slice(0, 5)
  }

  private static getBestOnePair(cards: Card[]): Card[] {
    const pair = this.findNOfAKind(cards, 2)
    if (pair.length === 0) return this.getHighCards(cards, 5)
    const kickers = this.getHighCards(
      cards.filter((card) => card.rank !== pair[0].rank),
      3
    )
    return [...pair, ...kickers]
  }

  private static getFlushSuit(cards: Card[]): Suit | null {
    const suitCounts = cards.reduce((counts, card) => {
      counts.set(card.suit, (counts.get(card.suit) || 0) + 1)
      return counts
    }, new Map<Suit, number>())
    const entries = Array.from(suitCounts.entries())
    for (const [suit, count] of entries) {
      if (count >= 5) return suit
    }
    return null
  }

  private static isConsecutive(ranks: Rank[]): boolean {
    const rankOrder = [...Object.values(Rank)]
    rankOrder.push(rankOrder.shift() as Rank) // Move Ace to the end
    const indices = ranks.map((rank) => rankOrder.indexOf(rank))
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] - 1) return false
    }
    return true
  }

  private static getHighCards(cards: Card[], count: number): Card[] {
    return cards.sort((a, b) => this.compareRanks(b.rank, a.rank)).slice(0, count)
  }
  private static compareRoyalFlush(hand1: Card[], hand2: Card[]): number {
    // All royal flushes are equal
    return 0
  }

  private static compareStraightFlush(hand1: Card[], hand2: Card[]): number {
    // Compare the highest card of each straight flush
    return this.compareHighCards(hand1, hand2)
  }

  private static compareFourOfAKind(hand1: Card[], hand2: Card[]): number {
    const quads1 = this.findNOfAKind(hand1, 4)[0]
    const quads2 = this.findNOfAKind(hand2, 4)[0]
    const quadsComparison = this.compareHighCards([quads1], [quads2])
    if (quadsComparison !== 0) return quadsComparison

    // If quads are equal, compare the kicker
    const kicker1 = hand1.find((card) => card.rank !== quads1.rank)
    const kicker2 = hand2.find((card) => card.rank !== quads2.rank)
    return this.compareHighCards([kicker1!], [kicker2!])
  }

  private static compareFullHouse(hand1: Card[], hand2: Card[]): number {
    const [trips1] = this.findNOfAKind(hand1, 3)
    const [trips2] = this.findNOfAKind(hand2, 3)
    const tripsComparison = this.compareHighCards([trips1], [trips2])
    if (tripsComparison !== 0) return tripsComparison

    const [pair1] = this.findNOfAKind(hand1, 2)
    const [pair2] = this.findNOfAKind(hand2, 2)
    return this.compareHighCards([pair1], [pair2])
  }

  private static compareFlush(hand1: Card[], hand2: Card[]): number {
    // Compare each card from highest to lowest
    for (let i = 0; i < 5; i++) {
      const comparison = this.compareHighCards([hand1[i]], [hand2[i]])
      if (comparison !== 0) return comparison
    }
    return 0
  }

  private static compareStraight(hand1: Card[], hand2: Card[]): number {
    // Compare the highest card of each straight
    return this.compareHighCards([hand1[0]], [hand2[0]])
  }

  private static compareThreeOfAKind(hand1: Card[], hand2: Card[]): number {
    const trips1 = this.findNOfAKind(hand1, 3)[0]
    const trips2 = this.findNOfAKind(hand2, 3)[0]
    const tripsComparison = this.compareHighCards([trips1], [trips2])
    if (tripsComparison !== 0) return tripsComparison

    // If trips are equal, compare the two kickers
    const kickers1 = hand1
      .filter((card) => card.rank !== trips1.rank)
      .sort((a, b) => this.compareRanks(b.rank, a.rank))
    const kickers2 = hand2
      .filter((card) => card.rank !== trips2.rank)
      .sort((a, b) => this.compareRanks(b.rank, a.rank))
    return this.compareHighCards(kickers1, kickers2)
  }

  private static compareTwoPair(hand1: Card[], hand2: Card[]): number {
    const pairs1 = this.findNOfAKind(hand1, 2).sort((a, b) => this.compareRanks(b.rank, a.rank))
    const pairs2 = this.findNOfAKind(hand2, 2).sort((a, b) => this.compareRanks(b.rank, a.rank))

    // Compare higher pairs
    const highPairComparison = this.compareHighCards([pairs1[0]], [pairs2[0]])
    if (highPairComparison !== 0) return highPairComparison

    // Compare lower pairs
    const lowPairComparison = this.compareHighCards([pairs1[1]], [pairs2[1]])
    if (lowPairComparison !== 0) return lowPairComparison

    // If both pairs are equal, compare the kicker
    const kicker1 = hand1.find((card) => !pairs1.some((pair) => pair.rank === card.rank))
    const kicker2 = hand2.find((card) => !pairs2.some((pair) => pair.rank === card.rank))
    return this.compareHighCards([kicker1!], [kicker2!])
  }

  private static compareOnePair(hand1: Card[], hand2: Card[]): number {
    const pair1 = this.findNOfAKind(hand1, 2)[0]
    const pair2 = this.findNOfAKind(hand2, 2)[0]
    const pairComparison = this.compareHighCards([pair1], [pair2])
    if (pairComparison !== 0) return pairComparison

    // If pairs are equal, compare the three kickers
    const kickers1 = hand1
      .filter((card) => card.rank !== pair1.rank)
      .sort((a, b) => this.compareRanks(b.rank, a.rank))
    const kickers2 = hand2
      .filter((card) => card.rank !== pair2.rank)
      .sort((a, b) => this.compareRanks(b.rank, a.rank))
    return this.compareHighCards(kickers1, kickers2)
  }

  private static compareHighCard(hand1: Card[], hand2: Card[]): number {
    // Compare each card from highest to lowest
    return this.compareHighCards(hand1, hand2)
  }
}
