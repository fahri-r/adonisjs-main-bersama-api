/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {

  Route.post('/register', 'AuthController.register').as('auth.register')
  Route.post('/login', 'AuthController.login').as('auth.login')
  Route.post('/otp-confirmation', 'AuthController.otpConfirmation').as('auth.otpConfirmation')

  Route.group(() => {
    Route.group(() => {
      Route.resource('venues', 'VenuesController').only(['index', 'store', 'show', 'update'])
      Route.resource('venues.fields', 'FieldsController').apiOnly()
    }).middleware(['role:owner'])

    Route.group(() => {
      Route.resource('bookings', 'BookingsController').only(['index', 'show', 'destroy'])
      Route.post('venues/:id/bookings', 'BookingsController.store').as('bookings.store')
      Route.post('bookings/:id/join', 'BookingsController.join').as('bookings.join')
      Route.post('bookings/:id/unjoin', 'BookingsController.unjoin').as('bookings.unjoin')
      Route.get('schedules', 'BookingsController.schedules').as('bookings.schedules')
    }).middleware(['role:user'])

  }).middleware(['auth'])

}).prefix('/api/v1')
