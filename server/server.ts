import { Server, type Socket } from 'socket.io'
import puppeteer, { type Browser, type Page } from 'puppeteer'

const PORT = 8080
const WIDTH = 800
const HEIGHT = 600

const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

async function emitScreenshot (socket: Socket, page: Page): Promise<void> {
  const data = await page.screenshot({
    optimizeForSpeed: true
  })
  socket.emit('image', data)
}

const checkInbounds = (x: number, y: number): boolean => {
  return (x >= 0 && x <= WIDTH) && (y >= 0 && y <= HEIGHT)
}

io.on('connection', async (socket) => {
  let browser: Browser
  let page: Page

  socket.on('url', async (url, tor) => {
    browser = await puppeteer.launch({
      args: [(tor === true) ? '--proxy-server=socks5://127.0.0.1:9050' : '']
    })
    page = await browser.newPage()

    await page.goto(url)
    await page.setViewport({ width: WIDTH, height: HEIGHT })
    await page.keyboard.press('Space')
    await emitScreenshot(socket, page)
  })

  socket.on('getimg', async () => {
    await emitScreenshot(socket, page)
  })

  socket.on('click', async (x, y) => {
    if (checkInbounds(x, y)) {
      await page.mouse.click(x, y)
    }
  })

  socket.on('wheel', async (x, y, deltaX, deltaY) => {
    if (checkInbounds(x, y)) {
      await page.mouse.wheel({
        deltaX,
        deltaY
      })
    }
  })

  socket.on('keydown', async (code) => {
    await page.keyboard.down(code)
  })

  socket.on('keyup', async (code) => {
    await page.keyboard.up(code)
  })
})

io.listen(PORT)
console.log(`[server]: Server is running at http://localhost:${PORT}`)
