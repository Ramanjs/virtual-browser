import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import errorHandler from './middleware/error'
import { Server } from 'socket.io'

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
