import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Schedules extends BaseSchema {
  protected tableName = 'schedules'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id', 10).unsigned()
      table.integer('booking_id', 10).unsigned()
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('user_id').references('users.id')
      table.foreign('booking_id').references('bookings.id')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign('user_id')
      table.dropForeign('booking_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
