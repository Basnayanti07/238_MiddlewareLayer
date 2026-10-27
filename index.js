import expreess from 'express'
import pg from 'pg'
import joi from 'joi'

const app = expreess()
const port = 3000
const { Pool } = pg

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mahasiswa',
    password: '12345678',
    port: 5432
})

app.use(expreess.json())
app.use(expreess.urlencoded({ extended: true }))