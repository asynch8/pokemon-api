import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { createPokemon, getPokemons, type Pokemon } from '../clients/pokemon';
import convert from 'ts-interface-to-json-schema';
import path from 'path';
type FastifyRequestGet = FastifyRequest<{
  Querystring: {
    name: Array<string>;
    type: Array<string>;
    sorting: Array<string>;
    sortDirection: 'asc' | 'desc';
  };
}>;

type FastifyRequestPost = FastifyRequest<{
  Body: Pokemon;
}>;

/**
 * This function converts the Pokemon interface to a AJV schema using the ts-interface-to-json-schema package
 *
 * @returns the Pokemon Type in AJV schema format
 */
function getPokemonSchema() {
  const schema = convert(
    'Pokemon', // Interface name
    path.resolve(__dirname, '../clients/pokemon.ts') // Path to interface location
  );
  // Remove id from the schema
  delete schema.properties.id;
  // Clean up the required array(id will be at the start)
  schema.required.shift();
  return schema;
}

export default function (
  f: FastifyInstance,
  opts: FastifyPluginOptions,
  next: () => void
) {
  f.get(
    '/pokemon',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            name: {
              description:
                'Name of the pokemon to search for. Comma separated values.',
              type: 'array',
              items: { type: 'string', minLength: 3 },
              collectionFormat: 'csv'
            },
            type: {
              description:
                'Types of the pokemon to sort by. Comma separated values.',
              type: 'array',
              items: { type: 'string' },
              collectionFormat: 'csv'
            },
            sorting: {
              description:
                'Columns to sort by. Most columns should work fine. Comma separated values.',
              type: 'array',
              items: { type: 'string' },
              collectionFormat: 'csv'
            },
            sortDirection: {
              type: 'string',
              enum: ['asc', 'desc']
            }
          }
        }
      }
    },
    async (request: FastifyRequestGet) => {
      console.log(request.query);
      const filters = {
        name: request.query.name ? request.query.name[0].split(',') : [],
        type: request.query.type ? request.query.type[0].split(',') : []
      };
      const sorting = {
        sortKeys: request.query.sorting
          ? request.query.sorting[0].split(',')
          : ['id'],
        sortDirection: request.query.sortDirection
          ? request.query.sortDirection
          : 'asc'
      };
      return await getPokemons(filters, sorting);
    }
  );
  f.post(
    '/pokemon',
    {
      schema: {
        body: getPokemonSchema()
      }
    },
    async (request: FastifyRequestPost) => {
      console.log({ body: request.body });
      const pokemon = await createPokemon(request.body);
      console.log(request.body);
      return pokemon;
    }
  );
  next();
}
