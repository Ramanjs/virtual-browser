import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import errorHandler from './middleware/error'
import { Server } from 'socket.io'
import puppeteer from 'puppeteer'

dotenv.config()

const app = express()
const logger = morgan('dev')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use(logger)
app.use(errorHandler)

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server')
})

export const server = http.createServer(app)
const io = new Server(server)

io.on('connection', async (socket) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://google.com')
  await page.setViewport({ width: 1080, height: 1024 })

  const intervalId = setInterval(() => {
    page.screenshot()
      .then(data => {
        socket.emit('image', data)
      })
      .catch(err => {
        console.log(err)
      })
  }, 20)

  socket.on('disconnect', () => {
    clearInterval(intervalId)
  })
})
