import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

function App() {
  const canvasRef = useRef(null)
  const socket = io("http://localhost:8080")

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let imageUrl = ''

    socket.on('connect', () => {

      socket.on('image', (data) => {
        URL.revokeObjectURL(imageUrl)
        let image = new Image()
        imageUrl = URL.createObjectURL(new Blob([data])) 
        image.src = imageUrl
        image.onload = () => {
          ctx.drawImage(image, 0, 0)
          socket.emit('getimg')
        }
      })
    })
  }, [socket])

  return (
    <>
      <div>
        <h1>Hello world</h1>
        <canvas ref={canvasRef} width={800} height={600}></canvas>
      </div>
    </>
  )
}

export default App
