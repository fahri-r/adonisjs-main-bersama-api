import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class OtpCode extends BaseModel {
  /**
   * @swagger
   * definitions:
   *  OtpConfirmation:
   *    type: object
   *    properties:
   *      email:
   *        type: string
   *        description: registered email
   *      otp_code:
   *        type: integer
   *        description: user's otp code
   *    required:
   *      - email
   *      - otp_code
   */
  @column({ isPrimary: true })
  public id: number

  @column()
  public otpCode: number

  @column()
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
