describe('Sensor Platform Types', function () {

   it('Navigate to sensor platform types', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/')

      cy.get('.flex > .page-container > .navbar > button > .burger-icon').click()

      cy.get('.sidenav > .overflow-y-auto > .space-y-2 > li:nth-child(4) > .flex').click()

      cy.get('.space-y-2 > li > #dropdown > .flex:nth-child(2) > .flex').click()

   })

   it('filtering sensor types by name', function () {
      cy.visit('http://localhost:3000/sensor-platform-types')

      cy.intercept("GET", "http://localhost:8000/sensor-type").as("get_data")

      cy.wait("@get_data").its('response.statusCode').should('equal', 200)

      cy.get('.py-3:nth-child(2) > .flex > .font-medium > button > .w-6 > path').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').type('Zephyr')

      //assertion for the table data to contain the filter value
      cy.get('#Zephyr > :nth-child(2)').should('contain', 'Zephyr')

      cy.get('.py-3 > .flex > .relative > .table-filter-close-button > svg').click()

   })
})


describe('SensorPlatforms', function () {

   it('Navigate to sensor page', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/')

      cy.get('.page-container > .navbar > button > .burger-icon > path').click()

      cy.get('.overflow-y-auto > .space-y-2 > li:nth-child(4) > .flex > .ml-3').click()

      cy.get('.space-y-2 > li > #dropdown > .flex:nth-child(1) > .flex').click()

      cy.get('.py-3:nth-child(2) > .flex > .font-medium > button > .w-6').click()

   })

   it('View static map in sensor platform', function () {

      cy.visit('http://localhost:3000/sensor-platforms')

      cy.intercept("GET", "http://localhost:8000/sensor/joined?columns=id&columns=lookup_id&columns=serial_number&columns=active&columns=stationary_box&columns=time_updated&join_sensor_types=true&join_user=true").as("get_data")

      cy.wait("@get_data").its('response.statusCode').should('equal', 200)

      cy.get('.py-3:nth-child(2) > .flex > .font-medium > button > .w-6 > path').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').click()

      cy.get('tr > .py-3 > .flex > .relative > .table-filter-input').type('814')

      cy.get('#814 > :nth-child(5) > .flex > .table-view-map-button').click()

      cy.get('.py-3 > .w-fit > .text-gray-600 > svg > path').click()

   })

})


describe('API docs', function () {

   it('Navigate to API docs', function () {

      cy.visit('http://localhost:3000/')

      cy.get('.page-container > .navbar > button > .burger-icon > path').click()

      cy.get('.overflow-y-auto > .space-y-2 > li:nth-child(5) > .flex > .ml-3').click()

      //assertion for the url
      cy.url().should('eq', 'http://localhost:8000/docs')
   })

})


describe('Export data', function () {

   it('Navigate to export data page', function () {

      cy.viewport(1920, 965)

      cy.visit('http://localhost:3000/')

      cy.get('.page-container > .navbar > button > .burger-icon > path').click()

      cy.get('.overflow-y-auto > .space-y-2 > li:nth-child(3) > .flex > .ml-3').click()
   })

   it('Export data', function () {
      cy.visit('http://localhost:3000/export-data')


      cy.get('.page-container > .page > .form-container > .mb-4 > #start').type('2023-01-01')


      cy.get('.page-container > .page > .form-container > .mb-4 > #end').type('2023-03-01')



      cy.get('.form-container > .mb-4 > .form-group > .form-label:nth-child(1) > .form-checkbox').check('sensor_id')



      cy.get('.form-container > .mb-4 > .form-group > .form-label:nth-child(2) > .form-checkbox').check('measurement_count')



      cy.get('.form-container > .mb-4 > .form-group > .form-label:nth-child(3) > .form-checkbox').check('measurement_data')


      cy.get('.form-container > .mb-4 > .form-group > .form-label:nth-child(4) > .form-checkbox').check('stationary')


      cy.get('.form-container > .mb-4 > .form-group > .form-label:nth-child(5) > .form-checkbox').check('geom')


      cy.get('.form-container > .mb-4 > .form-group > .form-label:nth-child(6) > .form-checkbox').check('timestamp')

      cy.get('.page-container > .page > .form-container > .flex > .bg-green-500').click()

      //   cy.intercept("GET", "http://localhost:8000/sensor-summary?start=1-1-2023&end=1-3-2023&columns=sensor_id&columns=measurement_count&columns=measurement_data&columns=stationary&columns=geom&columns=timestamp").as("get_data")
      //   cy.wait("@get_data").its('response.statusCode').should('equal', 200)

      cy.wait(1000);

      //check if the file download button is visible
      cy.get('.page-container > .page > .form-container > .flex > .bg-green-500:nth-child(2)').should('be.visible')


   })

})



