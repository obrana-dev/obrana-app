import { Select as AriaSelect, type SelectProps } from 'react-aria-components'

export function Select<T extends object>(props: SelectProps<T>) {
  return <AriaSelect {...props} />
}
