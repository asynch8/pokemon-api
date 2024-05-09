# Pokemon-API

This is an API which handles pokemons. It's written in `Typescript`, using `Fastify` as a webframework, and `Knex.js` for database handling, using `Sqlite3` as a driver. Testing is done with `Jest`.

The project has the following directory structure

```text
- data - Contains data, like the initial JSON, the sqlite database and mocks used for the tests.
- db - Contains DB related files
  |- migrations - Contains the database schema through the migrations
  |- seeds - Contains a small function to read and map the pokemon.json into the migrations
- src - The codebase
  |- routes - Where the routes live
  |- clients - Modules that get information from places, for example a database
- tests - Test
  |- clients - Tests for the clients, more of unit tests mocking away the DB.
  |- routes - Integration tests essentially, taking advantage of fastify.inject to never actually have to make a http request, but still using a database

```

## Getting started local developing

You have two options when it comes to local development, either you can use `docker compose up` and service should start on its own, or you can simply opt to run everthing locally since no additional services are required to run it.

- Make sure you're running > node 18, or, you can use `nvm` to switch to the version used to develop with `nvm use`
- `npm i`
- `npm run migrate:latest` # Upgrade the database to the latest schema
- `npm run seed` # Load the initial JSON file into it

Once that is done, you can either

- `npm run start` # webserver should now be running on http://127.0.0.1:8080/
  Navigate to http://localhost:8080/documentation to use the built-in swagger-ui client.
  or
- `npm run test`

## Decisions

I picked `Fastify` as a webframework because it's fast and has a nice eco-system, comparable to Express.
It has built in requestvalidation using AJV, and because I'm using `@fastify/swagger`, I'm also able to generate the swagger specifications to use in the `swagger-ui` client shipped with the module.
I use this inconjunction with a library I have built earlier, `ts-interface-to-json-schema`, to automaticly generate the schema from the typescript types using `ts-morph`, so I can simpy define one structure and be done with it, although defining the structure isn't too bad anyway.
This custom-made library is likely not something I would run in production at this point in time to be clear, but thought I would include it for fun!

I'm using an `@fastify/autoload` to automatically load the routes from the src/routes directory where the directory structure corresponds to the actual API URL, making it simple to browse the code.

I picked `Knex.js` for database management as it's compatible with multiple databases, has migrations, and you don't have to work as ORM'y(even though there is some support in there for it).
Here I opted for defining the types in Typescript and then just fetching the data with queries.

I used `SQLite` as a database to make it as simple as possible to setup and run on any environment, making the initial time investment cost almost non-existent. This could be quite easily swapped out for another DB driver with some minor alterations.

The codebases formatting is controlled by `prettier` and `eslint`, and I'm using precommit hooks with `Husky` to ensure the code is always formatted correctly before being pushed
