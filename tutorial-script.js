// Welcome to Launchpad!
// Log in to edit and save pads, run queries in GraphiQL on the right.
// Click "Download" above to get a zip with a standalone Node.js server.
// See docs and examples at https://github.com/apollographql/awesome-launchpad

// graphql-tools combines a schema string with resolvers.
import { graphql, buildSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { MongoClient, ObjectID } from 'mongodb';

function fromMongo(item) {
  return {
    ...item,
    id: item._id.toString(),
  };
};

function toMongo(item) {
  return {
    ...item,
    _id: ObjectID(item.id),
  };
}

// Construct a schema, using GraphQL schema language
const typeDefs = `
	enum Genre {
		ACTION
		COMEDY
		THRILLER
		LOVESTORY
	}

	type Director {
		id: ID!
		name: String!
		movies: [Movie]
	}

	type Actor {
		id: ID!
		name: String!
		movies: [Movie]
	}

	interface Movie {
		id: ID!
		name: String!
		description: String
		director: Director!
	}

	type Documentary implements Movie {
		id: ID!
		name: String!
		description: String
		director: Director!
	}

	type FeatureFilm implements Movie {
		id: ID!
		name: String!
		description: String
		director: Director!
		actors: [Actor!]
		genre: Genre!
	}

  type Query {
		getMovie(name: String!): [Movie]!
		getActor: [Actor]
		getDirector(name: String!): [Director]!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    getActor: async (parent, args, context) => {
      return context.mongo.collection('actor').find({}).map(fromMongo).toArray();
    },
    getDirector: async ({ name }, context) => {
      return context.mongo.collection('director').find({}, { name: name }).map(fromMongo).toArray();
    },
    getMovie: async ({ name }, context) => {
      return context.mongo.collection('movie').find({}, { name: name }).map(fromMongo).toArray();
    }
  }
};


export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})