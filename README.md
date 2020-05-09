<h1 align="center">Vue share images</h1>

Full-Stack application for ```Vue.js``` with users authentication, that uses a ```GraphQL ``` backend. Lets you create posts, commenting posts, liking and more.

## Features
- JWT Autenthication
- Graphql/Apollo
- Posting, commenting, and liking posts
- Infinite scrolling using Vue Apollo
- Sorting data from the database

## Live demo
https://vue-share-images.now.sh/

## Getting started
```
# Clone the project repository by running the command below
$ git clone git@github.com:Reh4m/vue-share-images.git
```

## Environment variables
Create variables.env file and add:
```
MONGO_URI=`mongodb credentials`
SECRET=`secret password (jsonwebtoken)`
```

## Build Setup
```
# Install dependencies
npm install

# Install web app dependencies
$ cd client
npm install

# Run server and web app in dev mode (localhost:8080 | locahost:4000)
npm run dev
```
