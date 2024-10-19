# Cypress
```npx cypress open```

## Generating test report
```npx cypress run --reporter mochawesome```
```npx mochawesome-merge "cypress/results/*.json">mochawesome.json```
copy the contents of the generated json into a new json file called testReport.json
```npx marge testReport.json```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Additonal Notes to get development server started 

## Step 1: 
install node js (if you haven't got it already)

## Step 2: 
clone the repository

## Step 3: 
open CMD in the project folder and run the command below
> npm install

## Step 4: 
copy paste the .env.production file in the same location and rename it to .env.local

## Step 5: 
in the .env.local file change line 8 to be the URL of the localhost
> REACT_APP_AIRQUALITY_API_URL= http://localhost:8000/

## Step 6:
run the docker container for the api and database by either manually clicking and starting the docker container or using the command
>docker-compose up

## Step 7:
using a CMD in the project folder run the command below
> npm start


# Deployment
- temporaily delete the .env.local file
- ```npm run build```
- you may need to change the env varaible for REACT_APP_AIRQUALITY_API_URL
- ```firebase login```
- ```firebase init```
- select hosting, build, yes, no, no
- ```firebase deploy```
- undo deletion of the .env.local file