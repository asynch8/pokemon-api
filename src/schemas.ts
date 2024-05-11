import path from 'path';
// Custom-made library to convert TypeScript interfaces to JSON schema
import convert from 'ts-interface-to-json-schema';

// Convert the Pokemon interface to a AJV schema
export const pokemonSchema = convert(
  'Pokemon', // The exported propertyname. Needs to be an interface at the current moment
  path.join(__dirname, './clients/pokemon.ts') // Path to interface location
);

// TODO: Add support for Omit<>
export const pokemonWithoutIdSchema = JSON.parse(JSON.stringify(pokemonSchema));
// Remove id from the schema
delete pokemonWithoutIdSchema.properties.id;
// Clean up the required array(id will be at the start)
pokemonWithoutIdSchema.required.shift();
