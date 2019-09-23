import { Card, CardName, CARD_AMOUNTS, Gem } from "./defs"

const getMinRow: (name: CardName) => Card[] =
  id => [
    { id, main: Gem.Blue, decorations: [] },
    { id, main: Gem.Green, decorations: [] },
    { id, main: Gem.Grey, decorations: [] },
    { id, main: Gem.Purple, decorations: [] },
    { id, main: Gem.Red, decorations: [] },
    { id, main: Gem.Turquoise, decorations: [] },
  ]

export const getCardsWithMainGem: (name: CardName) => Card[] =
  id => Array.from ({ length: CARD_AMOUNTS [id] / 6 })
          .flatMap (() => getMinRow (id))
