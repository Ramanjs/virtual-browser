import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

const socket = io("http://localhost:8080")

function App() {
  const canvasRef = useRef(null)
  const [start, setStart] = useState(false)
  const [connected, setConnected] = useState(socket.connected)
  const [tor, setTor] = useState(false)
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

    socket.emit('url', url, tor)

    document.onclick = (e) => handleMouseClick(canvas, e)
    document.onwheel = (e) => handleMouseWheel(canvas, e)
    document.onkeydown = handleKeydown
    document.onkeyup = handleKeyup

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

  const getMousePos = (canvas, e) => {
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    return {x, y}
  }

  const handleMouseClick = (canvas, e) => {
    const {x, y} = getMousePos(canvas, e)
    socket.emit('click', x, y)
  }

  const handleMouseWheel = (canvas, e) => {
    const {x, y} = getMousePos(canvas, e)
    const deltaX = e.deltaX
    const deltaY = e.deltaY
    socket.emit('wheel', x, y, deltaX, deltaY)
  }

  const handleKeydown = (e) => {
    const code = e.code
    socket.emit('keydown', code)
  }

  const handleKeyup = (e) => {
    const code = e.code
    socket.emit('keyup', code)
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setStart(true)
  }

  const handleSessionEnd = () => {
    setStart(false)
    socket.emit('endsession')
  }

  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-200">
        {!start &&
        <div className="bg-white p-8 rounded-lg flex flex-col items-center">
          <h1 className="mb-8 text-2xl">Start a virtual browsing session</h1>
          <form className="flex space-x-4" onSubmit={handleSubmit}>
            <input type="url" className="border-2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://google.com" required/>
            <input type="submit" className="bg-blue-400 p-4 text-white cursor-pointer" value={"Start!"}/>
          </form>
          <div className="flex space-x-2 mt-2">
            <input type="checkbox" name="tor" onChange={(e) => setTor(e.target.checked)}/>
            <label htmlFor="tor">Use tor network</label>
          </div>
        </div>
        }
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className={start ? "" : "hidden"}></canvas>
        {start && <button className="m-4 bg-blue-400 p-2 text-white cursor-pointer rounded-md" onClick={handleSessionEnd}>End session</button>}
      </div>
    </>
  )
}

export default App
