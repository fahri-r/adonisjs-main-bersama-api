import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Field from './Field'
import User from './User'

export default class Booking extends BaseModel {
  /**
   * @swagger
   * definitions:
   *  BookingForm:
   *    type: object
   *    properties:
   *      id:
   *        type: uint
   *      title:
   *        type: string
   *        description: booking title
   *      play_date_start:
   *        type: string
   *        description: booking date start (yyyy-MM-dd HH:mm:ss)
   *      play_date_end:
   *        type: string
   *        description: booking date end (yyyy-MM-dd HH:mm:ss)
   *      field_id:
   *        type: integer
   *        description: field id to booking
   *    required:
   *      - title
   *      - play_date_start
   *      - play_date_end
   *      - field_id
   */

  public serializeExtras() {
    return {
      players_count: this.$extras.players_count
    }
  }
  
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column.dateTime()
  public playDateStart: DateTime

  @column.dateTime()
  public playDateEnd: DateTime

  @column()
  public userId: number

  @column()
  public fieldId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Field)
  public field: BelongsTo<typeof Field>

  @belongsTo(() => User)
  public booker: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'schedules'
  })
  public players: ManyToMany<typeof User>
}
