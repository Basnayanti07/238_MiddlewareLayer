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

//MIDDLESWARE

app.use((req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
        const duration = Date.now() - start 

        console.log({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`
        })
    })

    next()
})

//RESPONE ENVELOPE

function successResponse(res, message, status, details = null) {
    return res.status(status).json({
        success: true,
        message,
        data: null,
        error: null,
    })
}