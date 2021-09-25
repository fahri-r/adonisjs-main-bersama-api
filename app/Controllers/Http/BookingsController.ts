import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Booking from 'App/Models/Booking'
import User from 'App/Models/User'
import BookingValidator from 'App/Validators/BookingValidator'

export default class BookingsController {
    /**
    * @swagger
    * /api/v1/bookings:
    *   get:
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Booking
    *     summary: get all bookings
    *     responses:
    *       200:
    *         description: success get bookings
    *       401:
    *         description: unauthorized
    */
    public async index({ response }: HttpContextContract) {
        const bookings = await Booking.query()
            .select('id', 'title', 'user_id', 'play_date_start', 'play_date_end', 'field_id')
            .preload('field', (fieldQuery) => {
                fieldQuery.preload('venue', (venueQuery) => {
                    venueQuery.select('id', 'name', 'address', 'phone')
                })
            }).withCount('players')

        let data: Array<Object> = []
        for (let i = 0; i < bookings.length; i++) {
            let booking = {
                id: bookings[i].id,
                title: bookings[i].title,
                user_id: bookings[i].userId,
                play_date_start: bookings[i].playDateStart,
                play_date_end: bookings[i].playDateEnd,
                field_id: bookings[i].fieldId,
                type: bookings[i].field.type,
                players_count: bookings[i].$extras.players_count,
                venue: bookings[i].field.venue
            }
            data.push(...[booking])
        }

        return response.ok({ message: 'success get bookings', data })
    }

    /**
    * @swagger
    * /api/v1/venues/{venue_id}/bookings:
    *   post:
    *     parameters:
    *       - in: path
    *         name: venue_id
    *         type: integer
    *         required: true
    *         description: venue id
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Booking
    *     summary: booking a field
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/BookingForm'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/BookingForm'
    *     responses:
    *       201:
    *         description: venue created
    *       401:
    *         description: unauthorized
    *       422:
    *         description: some fields are invalid
    */
    public async store({ request, response, auth }: HttpContextContract) {
        const user = auth.user!
        const payload = await request.validate(BookingValidator)

        const booking = new Booking()
        booking.playDateStart = payload.play_date_start
        booking.playDateEnd = payload.play_date_end
        booking.title = payload.title
        booking.fieldId = payload.field_id

        await booking.related('booker').associate(user)

        return response.created({ message: 'booking created', data: booking })
    }

    /**
    * @swagger
    * /api/v1/bookings/{id}:
    *   get:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: booking id you want to show
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Booking
    *     summary: get booking by id
    *     responses:
    *       200:
    *         description: success get booking by id
    *       401:
    *         description: unauthorized
    *       404:
    *         description: booking not found
    */
    public async show({ response, params }: HttpContextContract) {
        const booking = await Booking.query()
            .where('id', params.id)
            .preload('field')
            .preload('players')
            .withCount('players')
            .firstOrFail()

        return response.ok({ message: 'success get booking by id', data: booking })
    }

    /**
    * @swagger
    * /api/v1/schedules:
    *   get:
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Booking
    *     summary: get user schedules
    *     responses:
    *       200:
    *         description: success get schedules
    *       401:
    *         description: unauthorized
    */
    public async schedules({ response, auth }: HttpContextContract) {
        const user = auth.user!
        const data = await User.query()
            .select('id', 'name', 'email', 'role')
            .where('id', user.id)
            .preload('schedules', (schedulesQuery) => {
                schedulesQuery.select('id', 'title', 'play_date_start', 'play_date_end', 'field_id')
                    .preload('field', (fieldQuery) => {
                        fieldQuery.select('id', 'name', 'type', 'venue_id')
                    })
            })
            .firstOrFail()

        return response.ok({ message: 'success get schedules', data })
    }

    /**
    * @swagger
    * /api/v1/bookings/{id}/join:
    *   post:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: booking id you want to join
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Booking
    *     summary: join booking by id
    *     responses:
    *       201:
    *         description: success join booking by id
    *       401:
    *         description: unauthorized
    *       404:
    *         description: booking not found
    */
    public async join({ response, params, auth }: HttpContextContract) {
        const booking = await Booking.findByOrFail('id', params.id)
        const user = auth.user!
        const alreadyJoin = await booking.related('players').query().wherePivot('user_id', user.id).first()
        if (!alreadyJoin) {
            await booking.related('players').attach([user.id])
        }

        return response.created({ message: 'success join schedules' })
    }

    /**
    * @swagger
    * /api/v1/bookings/{id}/unjoin:
    *   post:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: booking id you want to unjoin
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Booking
    *     summary: unjoin booking by id
    *     responses:
    *       200:
    *         description: success unjoin booking by id
    *       401:
    *         description: unauthorized
    *       404:
    *         description: booking not found
    */
    public async unjoin({ response, params, auth }: HttpContextContract) {
        const booking = await Booking.findByOrFail('id', params.id)
        const user = auth.user!

        await booking.related('players').detach([user.id])
        return response.ok({ message: 'success unjoin schedules' })
    }

    /**
    * @swagger
    * /api/v1/bookings/{id}:
    *   delete:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: booking id you want to delete
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Booking
    *     summary: delete booking data
    *     responses:
    *       200:
    *         description: booking deleted
    *       401:
    *         description: unauthorized
    *       404:
    *         description: booking not found
    */
    public async destroy({ response, params, auth }: HttpContextContract) {
        const user = auth.user!
        const booking = await Booking.query()
            .where('id', params.id)
            .andWhere('user_id', user.id)
            .firstOrFail()

        await booking.delete()
        return response.ok({ message: 'booking deleted' })
    }
}
