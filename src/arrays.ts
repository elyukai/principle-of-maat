export const extract: (index: number) => <A> (arr: A[]) => [A, A[]] =
  index => arr => [arr [index], [...arr.slice (0, index), ...arr.slice (index + 1)]]

export const partition: <A> (pred: (x: A) => boolean) => (xs: A[]) => [A[], A[]] =
  pred => xs => xs .reduce<[typeof xs, typeof xs]> (
                  (p, x) => pred (x)
                            ? [[...p [0], x], p [1]]
                            : [p [0], [...p [1], x]],
                  [[], []]
                )

// const mapWithKey: <A, B> (f: (key: string) => (x: A) => B) => (mp: Map<string, A>) => Map<string, B> =
//   f => mp => new Map (Object.entries (mp) .map (([key, val]) => [key, f (key) (val)]))

export const mapAccumR =
  <A, B, C>
  (f: (acc: A) => (val: B) => [A, C]) =>
  (initial: A) =>
  (xs: B[]): [A, C[]] =>
    xs .reduceRight<[A, C[]]> (
      ([old_acc, old_mapped], x) => {
        const [new_acc, new_x] = f (old_acc) (x)

        return [new_acc, [new_x, ...old_mapped]]
      },
      [initial, []]
    )

export const replicate: (len: number) => <A>(x: A) => A[] =
  len => x => Array.from ({ length: len }, () => x)

export const isPairOfArrEmpty: <A> (p: [A[], A[]]) => boolean =
  p => p [0] .length === 0 && p [1] .length === 0

export const pairArrLen = <A> (xss: [A[], A[]]): number => xss [0] .length + xss [1] .length
