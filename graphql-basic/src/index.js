import {GraphQLServer} from 'graphql-yoga';
import {users,comments,posts} from './data';

//Type definitions [schema]
const typeDefs = `
    type Query {
        me:User!,
        users(query:String): [User!],
        post: Post!,
        posts(query: String): [Post!],
        comments: [Comment!]!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]
        
    }

    type Comment {
        id: ID!
        text: String!
        post: Post! 
        author: User!
        


    }
`

//resolvers
const resolvers = {
    Query: {
        me(){
            return users[0];
        },
        users(parent,args,ctxt,info){
            console.log(args.query);
            if(!args.query){
                return users;
            }

            return users.filter((user)=>{
                return user.name.toLowerCase().includes(args.query.toLowerCase()) 
            })
        },
        post(){
            return posts[0]
        },
        posts(parent,args,ctxt,info){
            if(!args.query){
                return posts
            }

            return posts.filter((post)=>{
                return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        comments(paren,args,ctxt,info){
            return comments
        }
    },
    Post: {
        author(parent,args,ctxt,info){
            return users.find((user)=> {    
                return user.id === parent.author
                })
        },
        comments(parent,args,ctxt,info){
            return comments.filter((comment)=>{
                console.log(comment.id,parent.comment)
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts(parent,args,ctxt,info){
            return posts.filter((post)=>{
               return  post.author === parent.id
            })
        }
        ,
        comments(parent,args,ctxt,info){
            return comments.filter((comment)=>{
                return comment.author === parent.id 
            })
        }
    }
    ,
    Comment: {
        author(parent,args,ctxt,info){
            return users.find((user)=>{
                return user.id === parent.author
            })
        },
        post(parent,args,ctxt,info){
            return posts.find((post)=>{
                return post.id === parent.post
            })
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