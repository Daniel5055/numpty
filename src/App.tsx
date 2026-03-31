import { useState } from 'react'
import './App.css'
import { DragDropProvider } from '@dnd-kit/react'
import Card from './components/Card'
import Hand from './components/Hand'

function App() {
  const [isDropped, setIsDropped] = useState(false)

  return (
    <section id="center">
      <DragDropProvider onDragEnd={(event) => {
        if (event.canceled) return null

        const {target} = event.operation
        console.log('hello')

        setIsDropped(target?.id == "hand")
      }}>
        {!isDropped && <Card suit='spades' value='4' />}

        <Hand>
          {isDropped && <Card suit='spades' value='4' />}
        </Hand>
      </DragDropProvider>
    </section>
  )
}

export default App
