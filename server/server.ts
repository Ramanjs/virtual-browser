import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import errorHandler from './middleware/error'
import { Server, type Socket } from 'socket.io'
import puppeteer, { type Page } from 'puppeteer'

const WIDTH = 800
const HEIGHT = 600

dotenv.config()
const logger = morgan('dev')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(logger)
app.use(errorHandler)

app.get('/', (req, res) => {
  res.json('Express + TypeScript Server')
})

export const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

async function emitScreenshot (socket: Socket, page: Page): Promise<void> {
  const data = await page.screenshot({
    optimizeForSpeed: true,
    type: 'jpeg',
    quality: 10
  })
  socket.emit('image', data)
}

io.on('connection', async (socket) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  socket.on('url', async (url) => {
    // await page.goto('https://www.youtube.com/watch?v=3tfnIrEBoXA')
    await page.goto(url)
    await page.setViewport({ width: WIDTH, height: HEIGHT })
    await page.keyboard.press('Space')
    await emitScreenshot(socket, page)
  })

  socket.on('getimg', async () => {
    await emitScreenshot(socket, page)
  })

  socket.on('click', async (x, y) => {
    if ((x >= 0 && x <= WIDTH) && (y >= 0 && y <= HEIGHT)) {
      await page.mouse.click(x, y)
    }
  })
})
