import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Bookings extends BaseSchema {
  protected tableName = 'bookings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.integer('user_id', 10).unsigned()
      table.dateTime('play_date_start').notNullable()
      table.dateTime('play_date_end').notNullable()
      table.integer('field_id', 10).unsigned()
      table.timestamps(true, true)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('user_id').references('users.id')
      table.foreign('field_id').references('fields.id')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign('user_id')
      table.dropForeign('field_id')
    })

    this.schema.dropTable(this.tableName)
  }
}
