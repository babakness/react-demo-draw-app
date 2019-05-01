import { curry } from './functional'
export const withRef = curry(( ref, callback, event ) => {
  return ref.current 
    ? callback(ref.current, event)
    : null
})