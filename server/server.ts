import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'

dotenv.config()

export const app = express()
const logger = morgan('dev')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use(logger)

//app.use(errorHandler)

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server')
})
