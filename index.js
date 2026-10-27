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

//JOI VALIDATION

const biodataSchema = joi.object({
    id: Joi.number().integer().positive(),
    nama: Joi.string().trim().min(2).max(100).required(),
    nim: Joi.string().trim().min(1).max(20).required(),
    kelas: Joi.string().trim().min(1).max(20).required(),
})

const idSchema = joi.object({
    id: Joi.number().integer().positive().required()
})

//MIDDLEWARE VALIDATION BODY

function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { 
            abortEarly: false,
            convert: true,
            allowUnknown: false,
        })

        if (error) {
            return errorResponse(
                res, 
                'Validation error', 
                400, 
                error.details.map(item => item ({
                    field: item.path.join('.'),
                    message: item.message,
                }))
            )
        }

        req.body = value
        next()
    }
}