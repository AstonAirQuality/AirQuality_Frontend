import Credentials from '../fixtures/Credentials.json'

let test_user = Credentials.test_user;

describe('Register And Sign Out', function () {

  it('register test user mock data', function () {

    cy.viewport(1920, 965)

    cy.visit('http://localhost:3000/')

    cy.get('body > #root > .flex > .page-container > .page').click()

    cy.get('.page-container > .navbar > .user-menu > .user-menu-items:nth-child(2) > a').click()

    cy.get('.login-container > .login-form-container > .login-form > .mb-4 > #email').type(test_user.email)

    cy.get('.login-container > .login-form-container > .login-form > .mb-4 > #displayName').type(test_user.username)

    cy.get('.login-container > .login-form-container > .login-form > .w-full > #password').type(test_user.password)

    cy.get('.page-container > .page > .login-container > .login-form-container > .bg-green-500').click()

    cy.wait(2000)

    cy.url().should('eq', 'http://localhost:3000/')

    //sign out
    cy.get('.user-menu-items > button').click()

  })

})

describe('Login user', function () {

  it('Login to account', function () {

    cy.viewport(1920, 965)

    cy.visit('http://localhost:3000/')

    cy.get('body > #root > .flex > .page-container > .page').click()

    cy.get('.flex > .page-container > .navbar > .user-menu > .user-menu-items:nth-child(1)').click()

    cy.get('.page-container > .navbar > .user-menu > .user-menu-items:nth-child(1) > a').click()

    cy.get('.login-container > .login-form-container > .login-form > .mb-4 > #email').type(test_user.email)

    cy.get('.login-container > .login-form-container > .login-form > .w-full > #password').type(test_user.password)

    cy.get('.page-container > .page > .login-container > .login-form-container > .bg-green-500').click()

    // intercept the login request and  wait for it to complete
    cy.intercept("POST", "http://localhost:8000/auth/login").as("login")

    cy.wait("@login").its('response.statusCode').should('equal', 200)

    cy.url().should('eq', 'http://localhost:3000/')

  })
})

describe('Profile page', function () {

  it('Navigate to profile page', function () {

    cy.viewport(1920, 965)

    cy.visit('http://localhost:3000/')

    cy.get('.page-container > .navbar > button > .burger-icon > path').click()

    cy.get('.overflow-y-auto > .space-y-2 > li:nth-child(2) > .flex > .ml-3').click()

    // assert url
    cy.url().should('eq', 'http://localhost:3000/profile')

  })

  it('Copy Access token to clipboard', function () {

    cy.viewport(1920, 965)

    cy.visit('http://localhost:3000/profile')

    cy.get('#root > .flex > .page-container > .page > .bg-cyan-500').click()

    cy.wait(500)

    cy.get('#root > .flex > .page-container > .page > .form-success-alert').click()

  })

  it('Delete account', function () {

    cy.viewport(1920, 965)

    cy.visit('http://localhost:3000/profile')

    cy.get('.flex > .page-container > .page > .bg-red-500').click()

    // cy.intercept("DELETE", "http://localhost:8000/auth/user-account").as("delete_user")
    // cy.wait("@delete_user").its('response.statusCode').should('equal', 200)
    //check that user is redirected to sign in page
    cy.url().should('eq', 'http://localhost:3000/signin')
  })
})
