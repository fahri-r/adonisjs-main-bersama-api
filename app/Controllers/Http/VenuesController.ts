import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Venue from 'App/Models/Venue'
import VenueValidator from 'App/Validators/VenueValidator'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class VenuesController {
    /**
    * @swagger
    * /api/v1/venues:
    *   get:
    *     parameters:
    *       - in: query
    *         name: type
    *         type: string
    *         required: false
    *         description: can be filled with soccer, minisoccer, futsal, basketball, or volleyball
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Venue
    *     summary: get all venues
    *     responses:
    *       200:
    *         description: success get venues
    *       401:
    *         description: unauthorized
    *       422:
    *         description: some fields are invalid
    */
    public async index({ request, response }: HttpContextContract) {
        let venues: object = await Venue.query()
            .select('id', 'name', 'address', 'phone')
            .preload('fields', (fieldsQuery) => {
                fieldsQuery.select('id', 'name', 'type')
            })

        if (request.qs().type) {
            const searchSchema = schema.create({
                type: schema.enum(['soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball'])
            })
            const payload = await request.validate({ schema: searchSchema })

            venues = await Venue.query()
                .select('id', 'name', 'address', 'phone')
                .preload('fields', (fieldsQuery) => {
                    fieldsQuery.select('id', 'name', 'type')
                        .where('type', payload.type)
                })
        }

        return response.ok({ message: 'success get venues', data: venues })
    }

    /**
    * @swagger
    * /api/v1/venues:
    *   post:
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Venue
    *     summary: store venue data
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/VenueForm'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/VenueForm'
    *     responses:
    *       201:
    *         description: venue created
    *       401:
    *         description: unauthorized
    *       422:
    *         description: some fields are invalid
    */
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(VenueValidator)
        const venue = await Venue.create(payload)

        return response.created({ message: 'venue created', data: venue })
    }

    /**
    * @swagger
    * /api/v1/venues/{id}:
    *   get:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: venue id you want to show
    *       - in: query
    *         name: date
    *         type: string
    *         required: false
    *         description: booked date (yyyy-mm-dd)
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Venue
    *     summary: get venue by id
    *     responses:
    *       200:
    *         description: success get venue by id
    *       401:
    *         description: unauthorized
    *       404:
    *         description: venue not found
    *       422:
    *         description: some fields are invalid
    */
    public async show({ request, response, params }: HttpContextContract) {
        let date = new Date(Date.now()).toISOString().slice(0, 10)
        if (request.qs().date) {
            const searchSchema = schema.create({
                date: schema.date({
                    format: 'yyyy-MM-dd',
                })
            })
            const payload = await request.validate({ schema: searchSchema })
            date = payload.date.toString().slice(0, 10)
        }

        const venue = await Venue.query()
            .select('id', 'name', 'address', 'phone')
            .where('id', params.id)
            .preload('fields', (fieldsQuery) => {
                fieldsQuery
                    .select('id', 'name', 'type')
                    .preload('bookings', (bookingsQuery) => {
                        bookingsQuery
                            .select('id', 'title', 'user_id', 'play_date_start', 'play_date_end')
                            .where('play_date_start', 'like', `${date}%`)
                    })
            })
            .firstOrFail()

        let mergedBookings: Array<Object> = []
        for (let i = 0; i < venue.fields.length; i++) {
            mergedBookings.push(...venue.fields[i].bookings)
        }

        const data = {
            id: venue.id,
            name: venue.name,
            address: venue.address,
            phone: venue.phone,
            bookings: mergedBookings
        }

        return response.ok({ message: 'success get venue by id', data })
    }

    /**
    * @swagger
    * /api/v1/venues/{id}:
    *   put:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: venue id you want to update
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Venue
    *     summary: update venue data
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/VenueForm'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/VenueForm'
    *     responses:
    *       200:
    *         description: venue updated
    *       401:
    *         description: unauthorized
    *       404:
    *         description: venue not found
    *       422:
    *         description: some fields are invalid
    */
    public async update({ request, response, params }: HttpContextContract) {
        const payload = await request.validate(VenueValidator)

        let venue = await Venue.findOrFail(params.id)
        venue.name = payload.name
        venue.address = payload.address
        venue.phone = payload.phone
        await venue.save()

        return response.ok({ message: 'venue updated', data: venue })
    }

}
