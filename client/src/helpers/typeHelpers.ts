export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Pick only properties of type T, which value are from type Value
 * https://stackoverflow.com/a/69756175
 */
export type PickByType<T, Value> = {
    [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}

declare module "react" {
    // Redecalare forwardRef
    // for using generics with forwardRef followed by https://fettblog.eu/typescript-react-generic-forward-refs/#option-3%3A-augment-forwardref
    function forwardRef<T, P = {}>(
      render: (props: P, ref: React.Ref<T>) => React.ReactNode | null
    ): (props: P & React.RefAttributes<T>) => React.ReactNode | null;
  }
