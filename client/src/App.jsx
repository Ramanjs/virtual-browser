import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

function App() {
  const canvasRef = useRef(null)
  const [start, setStart] = useState(false)
  const [url, setUrl] = useState("")

  const WIDTH = 800;
  const HEIGHT = 600;

  useEffect(() => {
    if (!start) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let imageUrl = ''

    const socket = io("http://localhost:8080")

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
  }, [start])

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
