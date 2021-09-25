import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  manyToMany,
  ManyToMany,
  hasOne,
  HasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Booking from './Booking'
import OtpCode from './OtpCode'

export default class User extends BaseModel {
  /**
   * @swagger
   * definitions:
   *  Login:
   *    type: object
   *    properties:
   *      email:
   *        type: string
   *        description: registered email
   *      password:
   *        type: string
   *        description: registered password
   *    required:
   *      - email
   *      - password
   */

  /**
   * @swagger
   * definitions:
   *  Register:
   *    type: object
   *    properties:
   *      id:
   *        type: uint
   *      name:
   *        type: string
   *        description: user's fullname
   *      email:
   *        type: string
   *        description: email of unregistered users
   *      password:
   *        type: string
   *        description: password minimum 6 characters
   *      password_confirmation:
   *        type: string
   *      role:
   *        type: string
   *        description: can be filled with user or owner
   *    required:
   *      - name
   *      - email
   *      - password
   *      - password_confirmation
   */

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public isVerified: boolean

  @column()
  public role: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @manyToMany(() => Booking, {
    pivotTable: 'schedules'
  })
  public schedules: ManyToMany<typeof Booking>

  @hasOne(() => OtpCode)
  public otpCode: HasOne<typeof OtpCode>
}
