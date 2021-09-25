import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Fields extends BaseSchema {
  protected tableName = 'fields'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.enum('type', ['soccer', 'minisoccer', 'futsal', 'basketball', 'volleyball']).notNullable()
      table.integer('venue_id', 10).unsigned()
      table.timestamps(true, true)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('venue_id').references('venues.id')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign('venue_id')
    })
    this.schema.dropTable(this.tableName)
  }
}
