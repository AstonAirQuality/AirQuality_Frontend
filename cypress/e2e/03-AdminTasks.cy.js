import Credentials from '../fixtures/Credentials.json'

let test_user = Credentials.test_admin;
const zephyr_test_id = Credentials.zephyr_sensor_id;
// get today's and yesterday's date in the date field (format: yyyy-mm-dd)
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
const today = new Date().toISOString().split('T')[0]

//NOTE: This test assumes that there is at least one zephyr sensor in the database with id that matches (zephyr_test_id) and there is an admin user with credentials that match Credentials.test_admin

describe('Login user', function () {

   it('Login to account', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/')

      cy.get('body > #root > .flex > .page-container > .page').click()

      cy.get('.flex > .page-container > .navbar > .user-menu > .user-menu-items:nth-child(1)').click()

      cy.get('.page-container > .navbar > .user-menu > .user-menu-items:nth-child(1) > a').click()

      cy.get('.login-container > .login-form-container > .login-form > .mb-4 > #email').click()

      cy.get('.login-container > .login-form-container > .login-form > .mb-4 > #email').type(test_user.email)

      cy.get('.login-container > .login-form-container > .login-form > .w-full > #password').type(test_user.password)

      cy.get('.page-container > .page > .login-container > .login-form-container > .bg-green-500').click()

      // intercept the login request and  wait for it to complete
      cy.intercept("POST", "http://localhost:8000/auth/login").as("login")

      // wait for the login request and check status code
      cy.wait("@login").its("response.statusCode").should("eq", 200)

      cy.url().should('eq', 'http://localhost:3000/')
   })
})

describe('Sensor Platform Types', function () {

   it('add test sensor platform type', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/sensor-platform-types')

      cy.get('#mytable > .p-5 > .flex > .flex > .table-create-button').click()

      cy.get('#name').type('test')

      cy.get('#description').type('test')

      cy.get('#properties').type('{{}"test":"test"}')

      cy.get('.bg-green-500').click()

      cy.wait(1000)
      cy.get('.form-success-alert').should('exist')

      cy.get('.page > #modal > .crud-container > .text-gray-400 > svg').click()

      cy.get('.overflow-x-auto > #mytable > .p-5 > .flex > .table-refresh-button').click()

      //assert tablerow with id test exists
      cy.get('#test').should('exist')

   })

   it('Delete test sensor platform type', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/sensor-platform-types')

      cy.get('#test > .py-4 > .table-actions-dropdown').click()

      cy.get('#test > .py-4 > #dropdown > .table-delete-button').click()
   
      cy.get('.page > #modal > .modal > .flex > .bg-red-500').click()

      cy.wait(1000)
      cy.get('.form-success-alert').should('be.visible')

      cy.get('#modal > .modal > .flex > .text-gray-400 > svg').click()

      cy.get('.overflow-x-auto > #mytable > .p-5 > .flex > .table-refresh-button').click()

      //assert tablerow with id test does not exist
      cy.get('#test').should('not.exist')

   })
})

describe('Sensor Platform', function () {

   it('add test sensor platform', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/sensor-platforms')

      cy.get('.page > .overflow-x-auto > #mytable > .p-5 > .flex:nth-child(1)').click()

      cy.get('#mytable > .p-5 > .flex > .flex > .table-create-button:nth-child(1)').click()

      cy.get('#lookup_id').type('test')

      cy.get('#serial_number').type('test')

      cy.get('.form-checkbox').click()

      cy.get('#stationary_box').type("POLYGON ((-1.943986225709665 52.475830462626334,-1.9317246407796347 52.475830462626334,-1.9317246407796347 52.48249159681728,-1.943986225709665 52.48249159681728,-1.943986225709665 52.475830462626334))")

      cy.get('#modal > .crud-container > .form-container > .mb-4 > #user_id').type('None')

      cy.get('#modal > .crud-container > .form-container > .flex > .bg-green-500').click()

      cy.wait(500)
      cy.get('.form-success-alert').should('be.visible')

      cy.get('.page > #modal > .crud-container > .text-gray-400 > svg').click()

      cy.get('.overflow-x-auto > #mytable > .p-5 > .flex > .table-refresh-button').click()

      //assert tablerow with id test exists
      cy.get('#test').should('exist')

   })

   it('Delete sensor platform', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/sensor-platforms')

      cy.get('.py-3:nth-child(2) > .flex > .font-medium > button > .w-6').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').type('test')

      cy.get('#test > .py-4 > .table-actions-dropdown').click()

      cy.get('#test > .py-4 > #dropdown > .table-delete-button').click()

      cy.get('.page > #modal > .modal > .flex > .bg-red-500').click()

      cy.wait(500)
      cy.get('.form-success-alert').should('exist')

      cy.get('#modal > .modal > .flex > .text-gray-400 > svg').click()

      cy.get('.flex > .relative > .table-filter-close-button > svg > path').click()

      cy.get('.overflow-x-auto > #mytable > .p-5 > .flex > .table-refresh-button').click()

      //assert tablerow with id test does not exist
      cy.get('#test').should('not.exist')

   })

   it('add plume sensor platform', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/sensor-platforms')

      //wait for the sensor platform to be loaded
      cy.intercept("GET", "http://localhost:8000/sensor/joined?columns=id&columns=lookup_id&columns=serial_number&columns=active&columns=stationary_box&columns=time_updated&join_sensor_types=true&join_user=true").as("loadTable")
      cy.wait("@loadTable").its('response.statusCode').should('equal', 200)

      cy.get('#mytable > .p-5 > .flex > .flex > .table-create-button:nth-child(2)').click()

      cy.get('#modal > .crud-container > .form-container > .mb-4 > #serial_number').click()

      cy.get('#modal > .crud-container > .form-container > .mb-4 > #serial_number').type('02:00:00:00:48:13')

      cy.get('#modal > .crud-container > .form-container > .flex > .bg-green-500').click()


      // wait for post request to be sent
      // cy.intercept("POST", "http://localhost:8000/sensor/plume-sensors").as("plume")
      // cy.wait("@plume").its('response.statusCode').should('equal', 200)

      cy.wait(5000)
      cy.get('.form-success-alert').should('exist')

      cy.get('.page > #modal > .crud-container > .text-gray-400 > svg').click()

      cy.get('.overflow-x-auto > #mytable > .p-5 > .flex > .table-refresh-button').click()

      //assert tablerow with id 18699 exists
      cy.get('#18699').should('exist')

   })

   it('Delete plume sensor platform', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/sensor-platforms')

      cy.get('.py-3:nth-child(2) > .flex > .font-medium > button > .w-6').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').type('18699')

      cy.get('#18699 > .py-4 > .table-actions-dropdown').click()

      cy.get('#18699 > .py-4 > #dropdown > .table-delete-button').click()

      cy.get('.page > #modal > .modal > .flex > .bg-red-500').click()

      cy.wait(2000)
      cy.get('.form-success-alert').should('exist')

      cy.get('#modal > .modal > .flex > .text-gray-400 > svg').click()

      cy.get('.flex > .relative > .table-filter-close-button > svg > path').click()

      cy.get('.overflow-x-auto > #mytable > .p-5 > .flex > .table-refresh-button').click()

      //assert tablerow with id 18699 does not exist
      cy.get('#18699').should('not.exist')

   })

   it('Schedules a data ingestion task', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/sensor-platforms')

      cy.get('#mytable > .p-5 > .flex > .flex > .table-view-map-button').click()

      cy.get('#start').type(yesterday)
      cy.get('#end').type(today)

      cy.get('#modal > .crud-container > .form-container > .mb-4 > #sensor_ids').click()

      cy.get('#modal > .crud-container > .form-container > .mb-4 > #sensor_ids').type(zephyr_test_id)

      cy.get('#modal > .crud-container > .form-container > .flex > .bg-green-500').click()

      cy.wait(500)
      cy.get('.form-success-alert').should('be.visible')

      cy.get('.page > #modal > .crud-container > .text-gray-400 > svg').click()

   })

})


describe('Data Ingestion Logs', function () {

   it('Navigate to data ingestion logs page', function () {

      cy.viewport(987, 905)

      cy.visit('http://localhost:3000/')

      cy.get('.flex > .page-container > .navbar > button > .burger-icon').click()

      cy.get('.overflow-y-auto > .space-y-2 > li:nth-child(6) > .flex > .ml-3').click()

      cy.get('.space-y-2 > li > #dropdown > .flex:nth-child(3) > .flex').click()

      cy.url().should('include', '/logs')
   })

   it('Filter data ingestion logs', function () {

      cy.visit('http://localhost:3000/logs')

      cy.get('.w-full > .p-5 > .flex > form > #date').click()

      cy.get('.w-full > .p-5 > .flex > form > #date').click()

      cy.get('.w-full > .p-5 > .flex > form > #date').type(yesterday)
      cy.get('.w-full > .p-5 > .flex > form > #date').type(today)

      //intercept any request to the server using route with the auth token
      // cy.intercept("GET", "http://localhost:8000/data-ingestion-logs/findByDate/2023-02-13").as("filter")
      // cy.wait("@filter").its('response.statusCode').should('equal', 200)

      cy.wait(200)

      //check if the table is not empty and the success badge is visible
      cy.get('.divide-y > tr > :nth-child(1)').should('not.be.empty')
      cy.get('.success-badge').should('exist')
   })

})


describe('Manage Users', function () {

   it('Edit user role', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/')

      cy.get('#root > .flex > .page-container > .navbar > button').click()

      cy.get('.sidenav > .overflow-y-auto > .space-y-2 > li:nth-child(3) > .flex').click()

      cy.get('tr > .px-4 > .flex > .relative > .table-filter-input').select('user')

      cy.get('tr > .px-4 > .flex > .relative > .table-filter-input').select('admin')

      //enable edit role button
      cy.get('.bg-blue-500').click()

      //change first user's role to sensortech
      cy.get(':nth-child(4) > .text-gray-600 > .table-filter-input').select('sensortech')

      cy.get('.role-save-button').click()

      //change first user's role to back to admin
      cy.get(':nth-child(4) > .text-gray-600 > .table-filter-input').select('admin')

      cy.get('.role-save-button').click()

      cy.wait(100)
      cy.get('.form-success-alert').should('exist')

   })
})