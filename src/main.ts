import { writeFileSync } from 'fs'
import { extract, isPairOfArrEmpty, mapAccumR, pairArrLen, partition, replicate } from './arrays'
import { Card, CardName, DAY_GEMS, Gem, GEM_MAPS, GEM_MAPS_LEFT, PossibleDecorations } from "./defs"
import { getCardsWithMainGem } from './distributeMainGems'
import { printRes } from './print'
import { extractRandomGem, extractRandomGems } from './random'

const uncurry: <A, B, C> (f: (x: A) => (y: B) => C) => (p: [A, B]) => C =
  f => p => f (p [0]) (p [1])

const loop: <A> (isFinished: (seed: A) => boolean) =>
            <B> (f: (acc: B) => (seed: A) => [B, A]) =>
            (acc: B) =>
            (seed: A) => B =
  pred => f => acc => seed => pred (seed)
                              ? acc
                              : uncurry (loop (pred) (f))
                                        (f (acc) (seed))

const mapCardsToDecorations: (decorations: PossibleDecorations) =>
                             /**
                              * `[days, nights]`
                              */
                             (pool: [Gem[], Gem[]]) =>
                             (seed: Card[]) => [[Gem[], Gem[]], Card[]] =
  decs => pool => seed => {
    // first, map required gems
    const withRequired = mapAccumR <[Gem[], Gem[]], Card, Card>
                                   (acc => val => {
                                     const [extractedDay, leftDay] = extractRandomGem (acc [0])
                                     const [extractedNight, leftNight] = extractRandomGem (acc [1])

                                     return [
                                       [leftDay, leftNight],
                                       {
                                         ...val,
                                         decorations: [...val.decorations, extractedDay, extractedNight]
                                       }
                                     ]
                                   })
                                   (pool)
                                   (seed)

    if (decs !== 2) {
      const withOther = mapAccumR <Gem[], Card, Card>
                                  (acc => val => {
                                    if (acc .length < decs - 2) {
                                      console.error ("Pool not large enough")

                                      return [acc, val]
                                    }

                                    const [extracted, left] = extractRandomGems (decs - 2) (acc)

                                    return [
                                      left,
                                      {
                                        ...val,
                                        decorations: [...val.decorations, ...extracted]
                                      }
                                    ]
                                  })
                                  ([...withRequired [0] [0], ...withRequired [0] [1]])
                                  (withRequired [1])

      return [
        partition ((x: Gem) => DAY_GEMS .includes (x))
                  (withOther [0]),
        withOther [1]
      ]
    }

    return withRequired
  }

const partitionJokers = partition ((x: Card) => x .id === CardName.Joker)

const countMainGems = (xs: Card[]) => {
  const counter = {
    [Gem.Red]: 0,
    [Gem.Turquoise]: 0,
    [Gem.Purple]: 0,
    [Gem.Green]: 0,
    [Gem.Blue]: 0,
    [Gem.Grey]: 0,
  }

  xs .forEach (x => counter [x .main]++)

  return {
    [Gem [Gem.Red]]: counter [Gem.Red],
    [Gem [Gem.Turquoise]]: counter [Gem.Turquoise],
    [Gem [Gem.Purple]]: counter [Gem.Purple],
    [Gem [Gem.Green]]: counter [Gem.Green],
    [Gem [Gem.Blue]]: counter [Gem.Blue],
    [Gem [Gem.Grey]]: counter [Gem.Grey],
  }
}

// const countMainGemsInPairs = (xs: [Card, Card][]) => {
//   const counter = {
//     [Gem.Red]: 0,
//     [Gem.Turquoise]: 0,
//     [Gem.Purple]: 0,
//     [Gem.Green]: 0,
//     [Gem.Blue]: 0,
//     [Gem.Grey]: 0,
//   }

//   xs .forEach (x => {
//     counter [x [0] .main]++
//     counter [x [1] .main]++
//   })

//   return {
//     [Gem [Gem.Red]]: counter [Gem.Red],
//     [Gem [Gem.Turquoise]]: counter [Gem.Turquoise],
//     [Gem [Gem.Purple]]: counter [Gem.Purple],
//     [Gem [Gem.Green]]: counter [Gem.Green],
//     [Gem [Gem.Blue]]: counter [Gem.Blue],
//     [Gem [Gem.Grey]]: counter [Gem.Grey],
//   }
// }

const getMatchingCardGemIx: (left: Card[]) => (gem: Gem) => number =
  left => gem => {
    const ix = left .findIndex (c => c .main === gem)

    if (ix === -1) {
      console.error (countMainGems (left))
      console.error (Gem [gem])
      throw new RangeError (`getMatchingCardGemIx: ix = -1 with left items = ${JSON.stringify (countMainGems (left))} and gem = ${Gem [gem]}`)
    }

    return ix
  }

const extractFirstMatchingCardGem: (left: Card[]) => (gem: Gem) => [Card, Card[]] =
  left => gem => extract (getMatchingCardGemIx (left) (gem)) (left)

const extractFirstMatchingCardGemPair: (lefts: [Card[], Card[]]) =>
                                       (gems: [Gem, Gem]) => [[Card[], Card[]], [Card, Card]] =
  lefts => gems => {
    const [extLeft, leftLeft] = extractFirstMatchingCardGem (lefts [0]) (gems [0])
    const [extRight, leftRight] = extractFirstMatchingCardGem (lefts [1]) (gems [1])

    return [[leftLeft, leftRight], [extLeft, extRight]]
  }

const pairCards: (xss: [Card[], Card[]]) => [Card, Card][] =
  loop<[Card[], Card[]]> (isPairOfArrEmpty)
                         ((old_pairs: [Card, Card][]) => old_pool => {
                           const [new_pool, new_pairs] =
                             mapAccumR (extractFirstMatchingCardGemPair)
                                       (old_pool)
                                       (pairArrLen (old_pool) > 24 ? GEM_MAPS : GEM_MAPS_LEFT)

                           return [[...old_pairs, ...new_pairs], new_pool]
                         })
                         ([])

const orderCardPairs: (xss: [Card, Card][]) => [Card, Card][] =
  xss => xss .map (([fst, snd]) => DAY_GEMS .includes (fst .main) ? [fst, snd] : [snd, fst])

// const traceId = <A> (x: A) => (console.log (x), x)

const makeCards = (xs: CardName[]) =>
                  (decs: PossibleDecorations) =>
                  (pool: [Gem[], Gem[]]) =>
  mapCardsToDecorations (decs) (pool) (xs .flatMap (getCardsWithMainGem))

const groupCards = (cards: Card[]) => orderCardPairs (pairCards (partitionJokers (cards)))

// Data preparation

const pool: [Gem[], Gem[]] = [
  [
    ...replicate (125) (Gem.Blue),
    ...replicate (125) (Gem.Green),
    ...replicate (125) (Gem.Grey),
  ],
  [
    ...replicate (125) (Gem.Purple),
    ...replicate (125) (Gem.Red),
    ...replicate (125) (Gem.Turquoise),
  ],
]

// Match cards with 2 decorations (24)

const [poolAfter2, res2] =
  makeCards ([CardName.GunstDesTotengottes, CardName.Infiltration])
            (2)
            (pool)

// Match cards with 3 decorations (172)

const [poolAfter3, res3] =
  makeCards ([
              CardName.Diebstahl,
              CardName.Attentat,
              CardName.Embargo,
              CardName.AlleVerzierungenEntfernen,
              CardName.Ablass,
              CardName.Joker,
            ])
            (3)
            (poolAfter2)

// Match cards with 4 decorations (54)

const res4 =
  makeCards ([
              CardName.Überfluss,
              CardName.Händler,
              CardName.Goldschmied,
              CardName.ZusätzlichesKettengliedAusspielen,
              CardName.GöttlicheIntervention,
            ])
            (4)
            (poolAfter3) [1]

// Sum results

const groupedCard = groupCards ([...res2, ...res3, ...res4])

// console.log (groupedCard)

const lines = printRes (groupedCard)

writeFileSync ("output.md", lines)
