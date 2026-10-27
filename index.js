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

//MIDDLEWARE VALIDATION PARAMETER

function validateIParams(schema) {
     return (req, res, next) => {
        const { error } = schema.validate(req.params, { 
            abortEarly: false,
            convert: true,
            allowUnknown: false,
        })

        if (error) {
            return errorResponse(
                res, 
                'parameter tidak valid', 
                400, 
                error.details.map(item => item ({
                    field: item.path.join('.'),
                    message: item.message,
                }))
            )
        }

        req.params = value
        next()
    }
}

//METHOD GET

app.get('/', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM biodata ORDER BY id'
    )

    return successResponse(res, 'Data berhasil diambil', result.rows)
})

// METHOD POST

app.post(
'/', 
validateBody(biodataSchema), 
async (req, res) => {
    const {id, nama, nim, kelas} = req.body

    const result = await pool.query(
        'INSERT INTO biodata (id, nama, nim, kelas) VALUES ($1, $2, $3, $4) RETURNING *',
        [id ?? null, nama, nim, kelas]
    )

    return successResponse(
        res, 
        'Data berhasil ditambahkan', 
        result.rows[0], 
        201
    )
})

// METHOD PUT

app.put(
    '/biodata/:id',
    validateParams(idSchema),
    validateBody(biodataSchema.fork (
        ['nama', 'nim', 'kelas'], 
        field => field.optional()
    ).fork(['id'], field => field.forbidden())),
    async (req, res) => {
        const { id } = req.params
        const { nama, nim, kelas } = req.body

        const result = await pool.query(
            'UPDATE biodata SET nama = $1, nim = $2, kelas = $3 WHERE id = $4 RETURNING *',
            [nama, nim, kelas, id]
        )

        if (result.rowCount === 0) {
            return errorResponse(res, 'Data tidak ditemukan', 404)
        }

        return successResponse(
            res, 
            'Data berhasil diupdate',
            result.rows[0]
        )
    }
)

app.delete(
    '/biodata/:id',
    validateParams(idSchema),
    async (req, res) => {
        const { id } = req.params

        const result = await pool.query(
            'DELETE FROM biodata WHERE id = $1 RETURNING *',
            [id]
        )

        if (result.rowCount === 0) {
            return errorResponse(res, 'Data tidak ditemukan', 404)
        }

        return successResponse(
            res,
            'Data berhasil dihapus',
            result.rows[0]
        )
    }
)