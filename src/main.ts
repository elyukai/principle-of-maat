import { writeFileSync } from "fs"

enum Gem {
  Red,
  Turquoise,
  Purple,
  Green,
  Blue,
  Grey
}

const DAY_GEMS = [Gem.Blue, Gem.Green, Gem.Grey]

type PossibleDecorations = 2 | 3 | 4

const getRandomIndex: (arr_length: number) => number =
  l => Math.floor (Math.random () * Math.floor (l))

const extract: (index: number) => <A> (arr: A[]) => [A, A[]] =
  index => arr => [arr [index], [...arr.slice (0, index), ...arr.slice (index + 1)]]

const extractRandomGem: (xs: Gem[]) => [Gem, Gem[]] =
  xs => extract (getRandomIndex (xs .length)) (xs)

const extractRandomGems: (times: number) => (xs: Gem[]) => [Gem[], Gem[]] =
  times => xs => Array.from ({ length: times })
                   .reduce<[Gem[], Gem[]]> (
                     ([extracteds, left]) => {
                       const [newExtracted, newLeft] = extractRandomGem (left)

                       return [[...extracteds, newExtracted], newLeft]
                     },
                     [[], xs]
                   )

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

const partition: <A> (pred: (x: A) => boolean) => (xs: A[]) => [A[], A[]] =
  pred => xs => xs .reduce<[typeof xs, typeof xs]> (
                  (p, x) => pred (x)
                            ? [[...p [0], x], p [1]]
                            : [p [0], [...p [1], x]],
                  [[], []]
                )

// const mapWithKey: <A, B> (f: (key: string) => (x: A) => B) => (mp: Map<string, A>) => Map<string, B> =
//   f => mp => new Map (Object.entries (mp) .map (([key, val]) => [key, f (key) (val)]))

const mapAccumRWithKey =
  <K, A, B, C>
  (f: (key: K) => (acc: A) => (val: B) => [A, C]) =>
  (initial: A) =>
  (mp: Map<K, B>): [A, Map<K, C>] => {
    if (mp.size > 0) {
      const assocs = [...mp.entries ()]

      const [acc, newAssocs] = assocs .reduceRight<[A, [K, C][]]> (
        ([acc, xss], [key, val]) => {
          const [newAcc, newVal] = f (key) (acc) (val)

          return [newAcc, [[key, newVal], ...xss]]
        },
        [initial, []]
      )

      return [acc, new Map (newAssocs)]
    }

    return [initial, new Map<K, C> ()]
  }

type Partition<A> = [A, A]

type isPairOfArrEmpty = <A> (p: Partition<A[]>) => boolean

const isPairOfArrEmpty: isPairOfArrEmpty =
  p => p [0] .length === 0 && p [1] .length === 0

const mapCardsToDecorations: (decorations: PossibleDecorations) =>
                             /**
                              * `[days, nights]`
                              */
                             (pool: [Gem[], Gem[]]) =>
                             (seed: Map<string, Gem[]>) => [[Gem[], Gem[]], Map<string, Gem[]>] =
  decs => pool => seed => {
    // first, map required gems
    const withRequired = mapAccumRWithKey <string, Partition<Gem[]>, Gem[], Gem[]>
                                          (() => acc => val => {
                                            const [extractedDay, leftDay] = extractRandomGem (acc [0])
                                            const [extractedNight, leftNight] = extractRandomGem (acc [1])

                                            return [[leftDay, leftNight], [...val, extractedDay, extractedNight]]
                                          })
                                          (pool)
                                          (seed)

    if (decs !== 2) {
      const withOther = mapAccumRWithKey <string, Gem[], Gem[], Gem[]>
                                         (() => acc => val => {
                                           if (acc .length < decs - 2) {
                                             console.error ("Pool not large enough")

                                             return [acc, val]
                                           }

                                           const [extracted, left] = extractRandomGems (decs - 2) (acc)

                                           return [left, [...val, ...extracted]]
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

const replicate: (len: number) => <A>(x: A) => A[] =
  len => x => Array.from ({ length: len }, () => x)

const printRes: (mp: Map<string, Gem[]>) => (prevLines: string[]) => string[] =
  (mp: Map<string, Gem[]>) =>
  (prevLines: string[]): string[] =>
    [
      ...prevLines,
      ...([...mp] .map (([k, x]) => `${k}: ${x .sort () .map (e => Gem [e]) .join (", ")}`))
    ]

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

// const names = [
//   // 2 Decs
//   "Gunst des Totengottes", // 12
//   "Infiltration", // 12

//   // 3 Decs
//   "Diebstahl", // 6
//   "Attentat", // 6
//   "Embargo", // 6
//   "Alle Verzierungen entfernen", // 12
//   "Ablass", // 12
//   "Joker", // 120

//   // 4 Decs
//   "Überfluss", // 12
//   "Händler", // 12
//   "Goldschmied", // 12
//   "Zusätzliches Kettenglied ausspielen", // 12
//   "Göttliche Intervention" // 6
// ]

// Match cards with 2 decorations (24)

const mp2 = new Map<string, Gem[]> ([
  ...Array.from ({ length: 12 }, (_, i) => `Gunst des Totengottes (${i + 1})`),
  ...Array.from ({ length: 12 }, (_, i) => `Infiltration (${i + 1})`),
] .map (key => [key, []]))

const [poolAfter2, res2] = mapCardsToDecorations (2) (pool) (mp2)

// Match cards with 3 decorations (172)

const mp3 = new Map<string, Gem[]> ([
  ...Array.from ({ length: 6 }, (_, i) => `Diebstahl (${i + 1})`),
  ...Array.from ({ length: 6 }, (_, i) => `Attentat (${i + 1})`),
  ...Array.from ({ length: 6 }, (_, i) => `Embargo (${i + 1})`),
  ...Array.from ({ length: 12 }, (_, i) => `Alle Verzierungen entfernen (${i + 1})`),
  ...Array.from ({ length: 12 }, (_, i) => `Ablass (${i + 1})`),
  ...Array.from ({ length: 120 }, (_, i) => `Joker (${i + 1})`),
] .map (key => [key, []]))

const [poolAfter3, res3] = mapCardsToDecorations (3) (poolAfter2) (mp3)

// Match cards with 4 decorations (54)

const mp4 = new Map<string, Gem[]> ([
  ...Array.from ({ length: 12 }, (_, i) => `Überfluss (${i + 1})`),
  ...Array.from ({ length: 12 }, (_, i) => `Händler (${i + 1})`),
  ...Array.from ({ length: 12 }, (_, i) => `Goldschmied (${i + 1})`),
  ...Array.from ({ length: 12 }, (_, i) => `Zusätzliches Kettenglied ausspielen (${i + 1})`),
  ...Array.from ({ length: 6 }, (_, i) => `Göttliche Intervention (${i + 1})`),
] .map (key => [key, []]))

const res4 = mapCardsToDecorations (4) (poolAfter3) (mp4) [1]

// Sum results

const lines = printRes (res4) (printRes (res3) (printRes (res2) ([]))) .join ("\n")

writeFileSync ("output.md", lines)
