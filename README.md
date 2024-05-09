# Pokemon-API

This is an API which handles pokemons. It's written in Typescript, using Fastify as a webframework, and Knex.js for database handling, using Sqlite3 as a driver. Testing is done with Jest and Supertest.

It has the following directory structure

---

- data - Contains data, like the initial JSON, the sqlite database and mocks used for the tests.
- db - Contains DB
  | \-- migrations - Contains the database schema through the migrations
  | \-- seeds - Contains a small function to read and map the pokemon.json into the migrations
- src - The codebase
  | \- routes - Where the routes live  
  | \- clients - Modules that get information from places, for example a database
- tests - Tests

I picked Fastify as a webframework because it's fast and has a nice eco-system, comparable to Express.
It has built in validation requestvalidation using AJV, and because I'm using @fastify/swagger, I'm also able to generate the swagger specifications to use in the swagger-ui client shipped with the module.

I have built a library from before to automaticly generate the schema from the typescript types using ts-morph, so I can simpy define one structure and be done with it.
This library is likely not something I would run in production at this point in time to be clear, but thought I would include it for fun!

I'm using an '@fastify/autoload' to automatically load the routes from the src/routes directory where the directory structure corresponds to the actual API URL, making it simple to browse the code.

I picked Knex.js for database management as it's compatible with multiple databases, has migrations, and you don't have to work as ORM'y(even though there is some support in there for it).
Here I opted for defining the types in Typescript and then just fetching the data with queries.

I used SQLite to make it as simple as possible to setup and run on any environment, making the initial time investment cost almost non-existent. This could be quite easily swapped out for another DB driver with some minor alterations.

I opted for Prettier and Eslint to make the code uniform.

## Getting started local developing

You have two options when it comes to local development, either you can use docker compose, or you can

- npm i
- npm run migrate:latest # Upgrade the database to the latest schema
- npm run seed # Load the initial JSON file into it

Once that is done, you can either

- npm run start # webserver should now be running on http://127.0.0.1:8080/
  Navigate to http://localhost:8080/documentation to use the built-in swagger-ui client.

- npm run test

## Running it in Docker

While
