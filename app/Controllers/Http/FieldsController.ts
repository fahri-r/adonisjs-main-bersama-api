import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import FieldValidator from 'App/Validators/FieldValidator'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class FieldsController {
    /**
    * @swagger
    * /api/v1/venues/{venue_id}/fields:
    *   get:
    *     parameters:
    *       - in: path
    *         name: venue_id
    *         type: integer
    *         required: true
    *         description: venue id
    *       - in: query
    *         name: name
    *         type: string
    *         required: false
    *         description: field name
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Field
    *     summary: get all fields
    *     responses:
    *       200:
    *         description: success get venues
    *       401:
    *         description: unauthorized
    *       422:
    *         description: some fields are invalid
    */
    public async index({ request, response, params }: HttpContextContract) {
        const venue = await Venue.findOrFail(params.venue_id)
        let fields: Object = await Field.query()
            .where('venue_id', venue.id)

        if (request.qs().name) {
            const searchSchema = schema.create({
                name: schema.number()
            })
            const payload = await request.validate({ schema: searchSchema })

            fields = await Field.query()
                .where('name', payload.name)
                .andWhere('venue_id', venue.id)
        }

            return response.status(200).json({ message: 'success get fields', data: fields })
    }

    /**
    * @swagger
    * /api/v1/venues/{venue_id}/fields:
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
    *       - Field
    *     summary: store field data
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/FieldForm'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/FieldForm'
    *     responses:
    *       201:
    *         description: field created
    *       401:
    *         description: unauthorized
    *       404:
    *         description: venue not found
    *       422:
    *         description: some fields are invalid
    */
    public async store({ params, request, response }: HttpContextContract) {
        const payload = await request.validate(FieldValidator)
        const venue = await Venue.findOrFail(params.venue_id)
        let field = new Field()
        field.name = payload.name
        field.type = payload.type
        await field.related('venue').associate(venue)

        return response.created({ message: 'field created', data: field })
    }

    /**
    * @swagger
    * /api/v1/venues/{venue_id}/fields/{id}:
    *   get:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: field id you want to show
    *       - in: path
    *         name: venue_id
    *         type: integer
    *         required: true
    *         description: venue id
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Field
    *     summary: get field by id
    *     responses:
    *       200:
    *         description: success get field by id
    *       401:
    *         description: unauthorized
    *       404:
    *         description: venue or field not found
    */
    public async show({ params, response }: HttpContextContract) {
        let field = await Field.query()
            .select('id', 'name', 'type', 'venue_id')
            .where('id', params.id)
            .andWhere('venue_id', params.venue_id)
            .preload('bookings', (bookingsQuery) => {
                bookingsQuery.select('id', 'title', 'user_id', 'play_date_start', 'play_date_end')
            })
            .firstOrFail()

        return response.ok({ message: 'success get field by id', data: field })
    }

    /**
    * @swagger
    * /api/v1/venues/{venue_id}/fields/{id}:
    *   put:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: field id you want to update
    *       - in: path
    *         name: venue_id
    *         type: integer
    *         required: true
    *         description: venue id
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Field
    *     summary: update field data
    *     requestBody:
    *       required: true
    *       content:
    *           application/x-www-form-urlencoded:
    *               schema:
    *                   $ref: '#definitions/FieldForm'
    *           application/json:
    *               schema:
    *                   $ref: '#definitions/FieldForm'
    *     responses:
    *       200:
    *         description: venue updated
    *       401:
    *         description: unauthorized
    *       404:
    *         description: venue or field not found
    *       422:
    *         description: some fields are invalid
    */
    public async update({ request, response, params }: HttpContextContract) {
        const payload = await request.validate(FieldValidator)

        let field = await Field.query()
            .where('id', params.id)
            .andWhere('venue_id', params.venue_id)
            .firstOrFail()
        field.name = payload.name
        field.type = payload.type
        field.venueId = params.venue_id
        await field.save()

        return response.ok({ message: 'field updated', data: field })
    }

    /**
    * @swagger
    * /api/v1/venues/{venue_id}/fields/{id}:
    *   delete:
    *     parameters:
    *       - in: path
    *         name: id
    *         type: integer
    *         required: true
    *         description: field id you want to delete
    *       - in: path
    *         name: venue_id
    *         type: integer
    *         required: true
    *         description: venue id
    *     security:
    *       - bearerAuth: []
    *     tags:
    *       - Field
    *     summary: delete field data
    *     responses:
    *       200:
    *         description: field deleted
    *       401:
    *         description: unauthorized
    *       404:
    *         description: venue or field not found
    */
    public async destroy({ params, response }: HttpContextContract) {
        const field = await Field.query()
            .where('id', params.id)
            .andWhere('venue_id', params.venue_id)
            .firstOrFail()
        await field.delete()

        return response.ok({ message: 'field deleted' })
    }
}
