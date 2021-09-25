import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Field from './Field'

export default class Venue extends BaseModel {  
  /**
  * @swagger
  * definitions:
  *  VenueForm:
  *    type: object
  *    properties:
  *      name:
  *        type: string
  *        description: venue name
  *      address:
  *        type: string
  *        description: venue address
  *      phone:
  *        type: string
  *        description: venue phone contact
  *    required:
  *      - name
  *      - address
  *      - phone
  */
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public address: string

  @column()
  public phone: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Field)
  public fields: HasMany<typeof Field>
}
