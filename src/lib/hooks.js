import React from 'react'

export const useCounter = ( initialCount ) => {
  const [ counter, setCounter ] = React.useState( initialCount )
  const inc = () => setCounter( counter + 1 )
  const dec = () => setCounter( counter - 1 )
  const reset = () => setCounter( 0 )
  return { counter, inc, dec, reset, set: setCounter }
}
