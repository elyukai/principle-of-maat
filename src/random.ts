import { extract } from './arrays'
import { Gem } from './defs'

export const getRandomIndex: (arr_length: number) => number =
  l => Math.floor (Math.random () * Math.floor (l))

export const extractRandomGem: (xs: Gem[]) => [Gem, Gem[]] =
  xs => extract (getRandomIndex (xs .length)) (xs)

export const extractRandomGems: (times: number) => (xs: Gem[]) => [Gem[], Gem[]] =
  times => xs => Array.from ({ length: times })
                   .reduce<[Gem[], Gem[]]> (
                     ([extracteds, left]) => {
                       const [newExtracted, newLeft] = extractRandomGem (left)

                       return [[...extracteds, newExtracted], newLeft]
                     },
                     [[], xs]
                   )
