import '../shared/config/module-alias'
import express from 'express'
import cors from 'cors'
import { router } from './routes'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/payments', router)

const port = process.env.PORT ?? 3002

app.listen(port, () => { console.log(`Server running at port ${port}`) })
