import {GraphQLServer} from 'graphql-yoga';

//Type definitions [schema]
const typeDefs = `
    type Query {
        hello: String!
        name: String!
        location: String!
        bio: String
    }
`

//resolvers
const resolvers = {
    Query: {
        hello(){
            return "My first query string";
        },
        name(){
            return "Ingvald"
        },
        location(){
            return "Toulouse"
        },
        bio(){
            return " Learn GraphQl"
        }
    }
    
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(()=>{
    console.log("Server is running !")
})