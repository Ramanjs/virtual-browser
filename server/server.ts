import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import errorHandler from './middleware/error'
import { Server } from 'socket.io'
import puppeteer from 'puppeteer'

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

io.on('connection', async (socket) => {
  console.log(socket.id)
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://google.com')
  await page.setViewport({ width: 600, height: 400 })
  await page.keyboard.press('Space')

  const intervalId = setInterval(() => {
    page.screenshot({
      optimizeForSpeed: true,
      type: 'jpeg'
    })
      .then(data => {
        socket.emit('image', data)
      })
      .catch(err => {
        console.log(err)
      })
  }, 50)

  socket.on('disconnect', async () => {
    clearInterval(intervalId)
    await page.close()
    await browser.close()
  })
})
