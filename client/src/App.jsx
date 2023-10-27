import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    console.log(canvas)
    console.log(ctx)

    const socket = io("http://localhost:8080")
    socket.on('connect', () => {
      console.log(socket.id)
    })

    socket.on('image', (data) => {
      //console.log(data)

      let image = new Image()
      image.src = URL.createObjectURL(new Blob([data])) 
      image.onload = () => {
        ctx.drawImage(image, 0, 0)
      }
    })
  }, [])

  return (
    <>
      <div>
        <h1>Hello world</h1>
        <canvas ref={canvasRef} width={600} height={400}></canvas>
      </div>
    </>
  )
}

export default App
