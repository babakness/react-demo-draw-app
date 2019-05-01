
export const curry = ( fn, ...args ) =>  ( 
  args.length >= fn.length
  ? fn(...args)
  : curry.bind(null, fn, ...args)
  )
  
export const ap = ( ...fns ) => (...args ) => {
  return fns.flatMap( 
    fn => args.map( arg => fn(arg) )
  )
}
