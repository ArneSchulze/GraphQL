// Welcome to Launchpad!
// Log in to edit and save pads, run queries in GraphiQL on the right.
// Click "Download" above to get a zip with a standalone Node.js server.
// See docs and examples at https://github.com/apollographql/awesome-launchpad

// graphql-tools combines a schema string with resolvers.
import { graphql, buildSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { MongoClient, ObjectID, Db } from 'mongodb';

function fromMongo(item) {
  return {
    ...item,
    id: item._id.toString(),
  };
};

function toMongo(item) {
  return {
    ...item,
    _id: ObjectID(item.id)
  };
}

// Construct a schema, using GraphQL schema language
const typeDefs = `
type Author {
	id: ID!,
	name: String!,
	email: String
}

type Post {
	id: ID!,
	title: String!,
	description: String,
	authors: [Author]!
}

input AuthorInput {
	name: String!
}

input PostInput {
	title: String!,
  description: String,
  authors: [ID!]!
}

type Query {
	author(name: String!): [Author!]
  post(title: String!): [Post!]
}

type Mutation {
	insertAuthor(author: AuthorInput!): Author
	insertPost(post: PostInput!): Post
}
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    author: async (parent, { name }, context) => {
      return getAuthorByName(name, context.mongo);
    },
    post: async (parent, { title }, context) => {
      return getPostByTitle(title, context.mongo);
    }
  },
  Mutation: {
    insertAuthor: async (parent, { author }, context) => {
      return insertAuthor(author, context.mongo);
    },
    insertPost: async (parent, { post }, context) => {
      return insertPost(post, context.mongo);
    }
  },
  Post: {
    authors: async (parent, input, context) => {
      return getAuthorsByIds(parent.authors, context.mongo)
    }
  }
};

async function getAuthorByName(name, mongo) {
  return mongo.collection('authors').find({ name: name }).map(fromMongo).toArray();
}

async function getAuthorsByIds(ids, mongo) {
  var mapped = ids.map(id => new ObjectID(id));
  return mongo.collection('authors').find({ _id: { $in: mapped } }).map(fromMongo).toArray();
}

async function getPostByTitle(title, mongo) {
  return mongo.collection('posts').find({ title: title }).map(fromMongo).toArray();
}

async function insertAuthor(author, mongo) {
  var result = await mongo.collection('authors').insertOne(author);
  return fromMongo(await mongo.collection('authors').findOne({ _id: result.insertedId }))
}

async function insertPost(post, mongo) {
  var result = await mongo.collection('posts').insertOne(post);
  return fromMongo(await mongo.collection('posts').findOne({ _id: result.insertedId }))
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

let mongo;

export async function context(headers, secrets) {
  if (!mongo) {
    var result =  await MongoClient.connect("mongodb+srv://std:lOD2z6A9PhX6eMOf@eportfolio-e6yzb.mongodb.net/eportfolio")
    mongo = result.db('eportfolio')
  }
  return {
    mongo
  };
}