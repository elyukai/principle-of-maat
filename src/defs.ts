export enum Gem {
  Red,
  Turquoise,
  Purple,
  Green,
  Blue,
  Grey,
}

export enum CardName {
  // 2 Decs
  GunstDesTotengottes,
  Infiltration,

  // 3 Decs
  Diebstahl,
  Attentat,
  Embargo,
  AlleVerzierungenEntfernen,
  Ablass,
  Joker,

  // 4 Decs
  Überfluss,
  Händler,
  Goldschmied,
  ZusätzlichesKettengliedAusspielen,
  GöttlicheIntervention,
}

export const CARD_AMOUNTS = {
  // 2 Decs
  [CardName.GunstDesTotengottes]: 12,
  [CardName.Infiltration]: 12,

  // 3 Decs
  [CardName.Diebstahl]: 6,
  [CardName.Attentat]: 6,
  [CardName.Embargo]: 6,
  [CardName.AlleVerzierungenEntfernen]: 12,
  [CardName.Ablass]: 12,
  [CardName.Joker]: 120,

  // 4 Decs
  [CardName.Überfluss]: 12,
  [CardName.Händler]: 12,
  [CardName.Goldschmied]: 12,
  [CardName.ZusätzlichesKettengliedAusspielen]: 12,
  [CardName.GöttlicheIntervention]: 6,
}

export const GEM_MAPS: [Gem, Gem][] = [
  [Gem.Blue, Gem.Purple],
  [Gem.Blue, Gem.Red],
  [Gem.Blue, Gem.Turquoise],
  [Gem.Green, Gem.Purple],
  [Gem.Green, Gem.Red],
  [Gem.Green, Gem.Turquoise],
  [Gem.Grey, Gem.Purple],
  [Gem.Grey, Gem.Red],
  [Gem.Grey, Gem.Turquoise],
  [Gem.Purple, Gem.Blue],
  [Gem.Purple, Gem.Green],
  [Gem.Purple, Gem.Grey],
  [Gem.Red, Gem.Blue],
  [Gem.Red, Gem.Green],
  [Gem.Red, Gem.Grey],
  [Gem.Turquoise, Gem.Blue],
  [Gem.Turquoise, Gem.Green],
  [Gem.Turquoise, Gem.Grey],
]

export const GEM_MAPS_LEFT: [Gem, Gem][] = [
  [Gem.Blue, Gem.Purple],
  [Gem.Blue, Gem.Red],
  [Gem.Green, Gem.Purple],
  [Gem.Green, Gem.Turquoise],
  [Gem.Grey, Gem.Red],
  [Gem.Grey, Gem.Turquoise],
  [Gem.Purple, Gem.Blue],
  [Gem.Purple, Gem.Green],
  [Gem.Red, Gem.Blue],
  [Gem.Red, Gem.Grey],
  [Gem.Turquoise, Gem.Green],
  [Gem.Turquoise, Gem.Grey],
]

export const DAY_GEMS = [Gem.Blue, Gem.Green, Gem.Grey]

export type PossibleDecorations = 2 | 3 | 4

export interface Card {
  id: CardName
  decorations: Gem[]
  main: Gem
}
