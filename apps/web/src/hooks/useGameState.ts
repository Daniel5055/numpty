import { boardAdd, boardUnique, boardUnresolved } from "@repo/core/board"
import {
  type Board,
  blankCard,
  type CardValue,
  type ICard,
  includesCard,
  removeCard,
  removeLast,
} from "@repo/core/card"
import type { Engine, Handlers } from "@repo/core/engine"
import _ from "lodash"
import { MersenneTwister19937, Random } from "random-js"
import { type RefObject, useEffect, useMemo, useRef, useState } from "react"
import SimpleAi from "../utils/ai/simpleAi"
import ContextManager from "../utils/contextManager"
import { ClientEngine } from "../utils/engines/ClientEngine"
import { type GameState, type MatchState } from "../utils/game"

interface St {
  board: Board
  attacking: boolean
}

function useGameState(id1: string, engine: RefObject<Engine>): GameState {
  const nextId = useRef(0)

  // State controlling hands, board, deck and discards, including animations
  const [hand, setHand] = useState<ICard[]>([])
  const [deck, setDeck] = useState<ICard | undefined>(undefined)
  const [discard, setDiscard] = useState<ICard[]>([])
  const [opHand, setOpHand] = useState<ICard[]>([])
  const [board, setBoard] = useState<[ICard, ICard?][]>([])

  // User facing state
  const [matchState, setMatchState] = useState<MatchState>("Wait")
  const [attacking, setAttacking] = useState<boolean>(true)
  const [trump, setTrump] = useState<ICard | undefined>()

  // Number of cards in deck excluding
  const [deckCount, setDeckCount] = useState<number>(0)

  // Internal state
  const [attackOptions, setAttackOptions] = useState<Set<CardValue>>(new Set())
  const [toGrant, setToGrant] = useState<ICard[]>([])

  const cmRef = useRef(
    new ContextManager<St>({
      board: setBoard,
      attacking: setAttacking,
    }),
  )

  // Animations
  function drawCards(
    cm: ContextManager<St>,
    cards: ICard[],
    opDrawn: number,
    first: boolean,
    trump?: ICard,
  ) {
    if (cards.length === 0 && opDrawn === 0) return cm

    const drewTrump = trump ? includesCard(cards, trump) : undefined

    let left = opDrawn - (drewTrump === false ? 1 : 0)
    let toDraw = drewTrump ? removeLast(cards) : cards

    // Drawing a blank card
    const drawBlank = (_cm: ContextManager<St>) => {
      const blank = blankCard(nextId.current++)
      return _cm
        .then(() => setDeck(blank))
        .wait()
        .then(() => {
          setDeck(undefined)
          setDeckCount((c) => c - 1)
          setOpHand((h) => h.concat(blank))
        })
        .wait()
    }

    // Draw op card if not first
    if (!first && left > 0) {
      left--
      cm.queue(drawBlank)
    }

    // Draw cards until and alternate with op if possible
    for (let i = 0; i < toDraw.length; i++) {
      cm.then(() => setDeck(toDraw[i]))
        .wait()
        .then(() => {
          setDeck(undefined)
          setHand((h) => h.concat(toDraw[i]))
          setDeckCount((c) => c - 1)
        })
        .wait()

      if (left > 0) {
        left--
        cm.queue(drawBlank)
      }
    }

    while (left > 0) {
      left--
      cm.queue(drawBlank)
    }

    // Who draws the trump
    if (trump) {
      cm.then(() => {
        // Update trump to trump that has been drawn
        setTrump((t) => (t ? { ...t, id: 1 } : undefined))
        if (drewTrump) {
          setHand((h) => h.concat(trump))
        } else {
          setOpHand((h) => h.concat(trump))
        }
      })
        .wait(drewTrump ? 0 : 400)
        .then(() => {
          if (!drewTrump) {
            setOpHand((h) => removeLast(h).concat(blankCard(nextId.current++)))
          }
        })
    }

    return cm
  }

  function playCard(cm: ContextManager<St>, card1: ICard, card2?: ICard) {
    return cm
      .then(() => setOpHand((h) => removeLast(h).concat(card1)))
      .wait()
      .then(() => {
        setOpHand((h) => removeLast(h))
        setBoard((b) => boardAdd(b, card1, card2))
      })
      .wait()
  }

  function opTakeBoard(cm: ContextManager<St>, except?: ICard) {
    return cm
      .state("board", (board) => {
        const cards = _.reverse(_.zip(...board))
          .flat()
          .filter((c) => c !== undefined && c !== except) as ICard[]
        setOpHand((h) => {
          const toAdd = cards.filter((c) => !includesCard(h, c))
          return h.concat(toAdd)
        })
        setBoard(except ? boardAdd([], except) : [])
      })
      .wait(400)
      .then(() => {
        setOpHand((h) => h.map(() => blankCard(nextId.current++)))
      })
      .wait()
  }

  function finishBoard(cm: ContextManager<St>) {
    return cm
      .state("board", (board) => {
        const cards = _.reverse(_.zip(...board))
          .flat()
          .filter((c) => c !== undefined) as ICard[]
        setDiscard((d) => {
          const toAdd = cards.filter((c) => !includesCard(d, c))
          return d.concat(toAdd)
        })
        setBoard([])
      })
      .wait()
  }

  const userHandlers = useMemo<Handlers>(() => {
    return {
      attacked: (card) => {
        cmRef.current
          .then(() => setMatchState("Wait"))
          .queue((cm) => playCard(cm, card))
          .then(() => setMatchState("PendingDefence"))
      },
      defended: (card, against) => {
        cmRef.current
          .then(() => setMatchState("Wait"))
          .queue((cm) => playCard(cm, card, against))
          .state("board", (board) => {
            // Hacky way to access state within nested callback
            setAttackOptions((ao) => new Set(ao).add(card.value))
            if (boardUnresolved(board).length > 0) {
              setMatchState("PendingExtraAttack")
            } else {
              setMatchState("PendingAttack")
            }
          })
      },
      reversed: (card) => {
        cmRef.current
          .queue((cm) => playCard(cm, card))
          .then(() => {
            setAttacking(false)
            setMatchState("PendingDefence")
          })
          .wait()
      },
      drawn: (cards, opDrawn, first, trump) => {
        cmRef.current
          .queue((cm) => drawCards(cm, cards, opDrawn, first, trump))
          // Must use setter access state from nested callabck
          .state("attacking", (attacking) =>
            setMatchState(attacking ? "PendingAttack" : "PendingDefence"),
          )
          .wait()
      },
      conceded: () => {
        cmRef.current
          .then(() => {
            setMatchState("PendingGrant")
            setAttackOptions(new Set())
          })
          .wait()
      },
      finished: () => {
        cmRef.current
          .queue((cm) => finishBoard(cm))
          .then(() => {
            setMatchState("PendingAttack")
            setAttackOptions(new Set())
            setAttacking(true)
          })
          .wait()
      },
      granted: (cards) => {
        cmRef.current
          .then(() => {
            setMatchState("Wait")
            if (cards.length > 0) {
              setOpHand((h) => removeLast(h, cards.length))
            }
            setBoard((b) => cards.reduce((b1, c) => boardAdd(b1, c), b))
          })
          .wait(cards.length === 0 ? 0 : 400)
          .state("board", (board) => {
            const bCards = board.flat().filter((c) => c !== undefined)
            setHand((h) => {
              const toAdd = bCards.filter((c) => !includesCard(h, c))
              return h.concat(cards).concat(toAdd)
            })
            setBoard([])
          })
          .wait()
      },
      gameEnd: (win) => {
        cmRef.current.then(() => setMatchState(win ? "Winner" : "Loser"))
      },
      gameStart: (attacking, trump, deck) => {
        cmRef.current.then(() => {
          setTrump(trump)
          setDeckCount(deck.length - 1)
          setAttacking(attacking)
        })
      },
    }
  }, [])

  // Assign engine handlers
  useEffect(() => {
    engine.current.register(id1, userHandlers)
    engine.current.start()
  }, [id1, userHandlers])

  // Interaction

  function attack(card: ICard): boolean {
    if (!attacking) {
      console.warn("Defender cannot attack")
      return false
    }

    if (attackOptions.size > 0 && !attackOptions.has(card.value)) {
      console.warn("Attacker must attack with valid card value")
      console.warn("options:", attackOptions)
      return false
    }

    cmRef.current
      .then(() => {
        setAttackOptions((ao) => new Set(ao).add(card.value))
        setMatchState("Wait")
        setBoard((b) => boardAdd(b, card))
        setHand((h) => removeCard(h, card))

        engine.current.attack(id1, card)
      })
      .wait()

    return true
  }

  function defend(card: ICard, against: ICard): boolean {
    if (attacking) {
      console.warn("Attacker cannot defend")
      return false
    }

    // TODO Check if defence is valid, then

    // Check that card is on board
    const i = board.findIndex(
      ([{ suit, value }]) => suit == against.suit && value == against.value,
    )
    if (i === -1 || board[i][1] !== undefined) {
      console.warn("Defend against complete stack")
      return false
    }

    cmRef.current
      .then(() => {
        setBoard((b) => boardAdd(b, card, against))
        setHand((h) => removeCard(h, card))

        if (boardUnresolved(board).length === 0) {
          setMatchState("Wait")
        } else {
          setMatchState("PendingDefence")
        }

        engine.current.defend(id1, card, against)
      })
      .wait()

    return true
  }

  function reverse(card: ICard): boolean {
    if (attacking) {
      console.warn("Attacker cannot reverse")
      return false
    }

    if (
      boardUnique(board).length > 1 ||
      boardUnresolved(board).length !== board.length
    ) {
      console.warn("Board state too advanced to reverse")
      return false
    }

    if (board[0][0].value !== card.value) {
      console.warn("Can only reverse same value cards")
      return false
    }

    cmRef.current
      .then(() => {
        setBoard((b) => boardAdd(b, card))
        setHand((h) => removeCard(h, card))
        setMatchState("Wait")
        setAttacking(true)

        engine.current.reverse(id1, card)
      })
      .wait()
    return true
  }

  function concede(): boolean {
    if (attacking) {
      console.warn("Attacker cannot concede")
      return false
    }

    cmRef.current
      .then(() => {
        setMatchState("Wait")
        setAttackOptions(new Set())

        engine.current.concede(id1)
      })
      .wait()

    return true
  }

  function finish(): boolean {
    if (!attacking) {
      console.warn("Defender cannot finish")
      return false
    }

    cmRef.current
      .queue((cm) => finishBoard(cm))
      .then(() => {
        setAttacking(false)
        setMatchState("Wait")
      })
      .wait()

    engine.current.finish(id1)

    return true
  }

  function grantEnd(card?: ICard): boolean {
    if (!card) {
      setMatchState("PendingAttack")
    } else {
      cmRef.current
        .then(() => {
          setAttackOptions((ao) => new Set(ao).add(card.value))
          setMatchState("Wait")
          setBoard((b) => boardAdd(b, card))
          setHand((h) => removeCard(h, card))
        })
        .wait(400)
    }

    cmRef.current
      .queue((cm) =>
        opTakeBoard(cm, card).then(() => {
          engine.current.grant(id1, toGrant)
          if (card) {
            engine.current.attack(id1, card)
          }
        }),
      )
      .then(() => {
        setToGrant([])
      })
      .wait()

    return true
  }

  function grant(card: ICard): boolean {
    cmRef.current.then(() => {
      setBoard((b) => boardAdd(b, card))
      setHand((h) => removeCard(h, card))
      setToGrant((g) => g.concat(card))
    })

    return true
  }

  return {
    // Match state
    attacking,
    matchState,
    trump,
    deckCount,

    // Card states
    hand,
    opHand,
    board,
    deck,
    discard,

    // Interaction
    attack,
    defend,
    reverse,
    concede,
    finish,
    grant,
    grantEnd,
  }
}

export default useGameState
