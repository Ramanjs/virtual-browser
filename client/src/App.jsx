import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

const socket = io("http://localhost:8080")

function App() {
  const canvasRef = useRef(null)
  const [start, setStart] = useState(false)
  const [connected, setConnected] = useState(socket.connected)
  const [url, setUrl] = useState("")

  const WIDTH = 800;
  const HEIGHT = 600;

  useEffect(() => {
    socket.on('connect', () => {
      console.log("connected", socket.id)
      setConnected(true);
    })

    socket.on('disconnect', () => {
      console.log("disconnected", socket.id)
      setConnected(false);
    })

    return () => {
      console.log("teardown", socket.id)
      socket.off('connect');
      socket.off('disconnect');
    }
  })

  useEffect(() => {
    if (!start) return
    if (!connected) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let imageUrl = ''

    socket.emit('url', url)

    document.onclick = (e) => handleMouseClick(canvas, e)

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

  }, [start, url, connected])

  const handleMouseClick = (canvas, e) => {
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    socket.emit('click', x, y)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStart(true)
  }

  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-200">
        {!start &&
        <div className="bg-white p-8 rounded-lg flex flex-col items-center">
          <h1 className="mb-4">Start a virtual browsing session</h1>
          <form className="flex space-x-4" onSubmit={handleSubmit}>
            <input type="url" className="border-2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://google.com" required/>
            <input type="submit" className="bg-blue-400 p-4 text-white cursor-pointer" value={"Start!"}/>
          </form>
        </div>
        }
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className={start ? "" : "hidden"}></canvas>
      </div>
    </>
  )
}

export default App
