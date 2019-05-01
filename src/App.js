import React from 'react';
import CanvasDraw from 'react-canvas-draw'
import { curry, ap } from './lib/functional'
import { useCounter } from './lib/hooks'
import { withRef } from './lib/react-helpers'

const getCanvasData = ( canvasDraw ) => {
  return canvasDraw.getSaveData() 
}

const saveCanvas = ( canvasDraw ) => {
  localStorage.setItem(
    'drawing', 
    getCanvasData( canvasDraw )  
  )
  return void 0
}

const loadCanvasData = curry(
  ( immediately, canvasDraw, dataString ) => {
    return canvasDraw.loadSaveData( 
      dataString, 
      immediately 
    )
  }
)
const loadCanvasDataImmediately = loadCanvasData( true )
const loadCanvasDataAnimated = loadCanvasData( false )


const undoCanvas = ( canvasDraw ) => {
  canvasDraw.undo()
}

const clearCanvas = ( canvasDraw ) => {
  canvasDraw.clear()
}

const redoCanvas = curry(
  ( cacheDataString, undos ) => ( canvasDraw ) => {
    const { lines, ...rest } = JSON.parse( cacheDataString )
    const undosAfterRedo = undos - 1
    const linesAfterRedo = (
      undosAfterRedo
        ? lines.slice(0,  -1 * ( undosAfterRedo )) 
        : lines
    )
    loadCanvasDataImmediately(
      canvasDraw,
      JSON.stringify({ lines: linesAfterRedo, ...rest }),
    )
  }
)

const syncCacheData = ( setCacheData ) => ( canvasDraw ) => (
  setCacheData( canvasDraw.getSaveData() )
)

const Draw = () => {
  /* Use Hooks */
  const CanvasRef = React.useRef()
  const dataRef = React.useRef( 
    localStorage.getItem('drawing') || '{"lines":[]}' 
  )
  const [ cacheData, setCacheData ] = React.useState( 
    dataRef.current 
  )
  const {
    counter: undos,
    inc: incUndos,
    dec: decUndos,
    reset: resetUndos,
    set: setUndos,
  } = useCounter( 0 )

  /* Variables */
  const isAtTheBeginning = (
    JSON.parse( cacheData ).lines.length  === undos 
  )

  const isAtTheEnd = undos === 0

  /* Helpers */
  const whenCanvasReady = withRef( CanvasRef )
  const setUndoAll = () => {
    setUndos( JSON.parse( cacheData ).lines.length )
  }

  /* Actions */
  const undoAction = ap( 
    incUndos,
    whenCanvasReady( undoCanvas )
  )

  const redoAction = ap(
    decUndos,
    whenCanvasReady( 
      redoCanvas( cacheData, undos ) 
    )
  )

  const mouseUpAction = ap(
    resetUndos,
    whenCanvasReady( 
      syncCacheData( setCacheData ) 
    ),
    whenCanvasReady( saveCanvas )
  )

  const drawAction = ap(
    mouseUpAction,
    whenCanvasReady( ( canvasDraw ) => {
      return loadCanvasDataAnimated( 
        canvasDraw,
        getCanvasData( canvasDraw ),
      )
    })
  )

  const clearAction = ap(
    setUndoAll,
    whenCanvasReady( clearCanvas )
  )

  return (
    <>
      <div className="App" onMouseUp={ mouseUpAction }>
        <CanvasDraw 
          ref={ CanvasRef } 
          saveData={ dataRef.current } 
          immediateLoading={ true }
        />
      </div>

      <button onClick={ clearAction } disabled={ isAtTheBeginning }>
        Undo All
      </button>
      <button onClick={ undoAction } disabled={ isAtTheBeginning }>
        Undo
      </button>
      <button onClick={ redoAction } disabled={ isAtTheEnd }>
        Redo
      </button>
      <button onClick={ drawAction }>
        Commit & Draw 
      </button>
    </>
  );

}

export default Draw
