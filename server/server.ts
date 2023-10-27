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
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://www.youtube.com/watch?v=3tfnIrEBoXA')
  await page.setViewport({ width: 800, height: 600 })
  await page.keyboard.press('Space')
  const data = await page.screenshot({
    optimizeForSpeed: true
  })
  socket.emit('image', data)

  socket.on('getimg', () => {
    page.screenshot({
      optimizeForSpeed: true
    })
      .then(data => {
        socket.emit('image', data)
      })
      .catch(err => {
        console.log(err)
      })
  })
})
