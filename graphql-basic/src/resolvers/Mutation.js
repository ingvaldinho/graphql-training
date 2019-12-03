import uuid4 from 'uuid/v4';


const Mutation = {
    createUser(parent,args,{db},info){
        const {email,name,age} = args.data;
        const emailTaken = db.users.some((user)=> user.email === email);

        if(emailTaken){
            throw new Error('Email taken.')
        }

        const user= {
            id: uuid4(),
            ...args.data
        }

        db.users.push(user);

        return user;
    },deleteUser(parent,args,{db},info){
        // Recherche de l'index correspondant à l'id passé en parametre
        const userIndex = db.users.findIndex((user)=>user.id == args.id);

        // -1 = utisateur pas présent dans notre tableau
        if(userIndex === -1){
            throw new Error('User not found')
        }
//          sinon suppresion de l'utilisateur dans le tableau avec méthode splice: retourne un tableau des elements supprimés
        const deletedUser = db.users.splice(userIndex,1);
        // on supprime les posts liés à l'utilisateur
        db.posts = db.posts.filter((post)=>{ 
            // on itére sur chaque post afin de voir si l'author du post match avec l'id user passé en argument
            const match = post.author === args.id;
            // si match, on itere sur le tableau de commentaire pour filtrer les commentaire liés à un post de l'utilisateur
            if(match){
            db.comments = db.comments.filter((comment)=> comment.post !== post.id  )
            }
        
            return !match;
        });
        // on fini en supprimant les commentaires écrit par l'utilisateur
        db.comments = db.comments.filter(comment => comment.author !== args.id);



        return deletedUser[0];

    },
    updateUser(parent,args,{db},info){
        const {id,data} = args;
        console.log(args.data);

        const userDB = db.users.find(user=>user.id === id);

        if(!userDB){
            throw new Error('User not found');            
        }

        if(typeof data.email === 'string'){
            const emailTaken = db.users.some(user=> user.email === data.email && !userDB);

            if(emailTaken){
                throw new Error('Email taken.')
            }

            userDB.email = data.email
        }

        if(typeof data.name === 'string'){
            userDB.name = data.name
        }

        if(typeof data.age !== undefined){
            userDB.age = data.age
        }

        return userDB
    }        
    ,createPost(parent,args,{db,pubsub},info){
        const {author}= args.data;
        const isAuthorExist = db.users.some((user)=> user.id===author);
        console.log(args.data);

        if(!isAuthorExist){
            throw new Error('Author does not exist !')
        }

        const post = {
            id: uuid4(),
            ...args.data
        }

        db.posts.push(post);
        if(post.published){
            pubsub.publish('post',{
                post: {
                    mutation: 'CREATED',
                    data: post
                }
            });
        }

        return post;
    },
    deletePost(parent,args,{db,pubsub},info){
        const {id}= args;
        const postIndex = db.posts.findIndex((post)=> post.id === id);
        

        if(postIndex === -1){
            throw new Error('Post not found.')
        }

        const [post] = db.posts.splice(postIndex,1);

        if(post.published){
            pubsub.publish('post',{
                post:{
                mutation: 'DELETED',
                data: post
            }
            })
        }

        db.comments = db.comments.filter((comment)=>comment.post !== id);


        return post;
    },
    updatePost(parent,args,{db,pubsub},info){
        const {id,data}= args;
        const post = db.posts.find(post => post.id === id);
        const originalPost = {...post};

        if(!post){
            throw new Error('Post not found.')
        }

        if(typeof data.title === 'string'){
            post.title = data.title
        }

        if(typeof data.body === 'string'){
            post.body = data.body
        }

        if(typeof data.published === 'boolean'){
            post.published = data.published;
            if(originalPost.published && !post.published ){
                //deleted
                pubsub.publish('post',{
                    post:{
                        mutation: 'DELETED',
                        data: originalPost
                    }
                })
            }else if(!originalPost.published && post.published){
                //created
                pubsub.publish('post',{
                    post:{
                        mutation: 'CREATED',
                        data: post
                    }
                })

            }
        }else if(post.published){
            //updated
            pubsub.publish('post',{
                post:{
                    mutation: 'UPDATED',
                    data: post
                }
            })
        }

        return post;
    },
    createComment(parent,args,{db,pubsub},info){
        const {author,post} = args.data;
        
        const isAuthorExist = db.users.some(user=>user.id === author);
        const isPostExistAndPublished = db.posts.some(item=> item.id=== post && item.published);

        if(!isAuthorExist){
            throw new Error('Author not found');
        }

        if(!isPostExistAndPublished){
            throw new Error('Post not found or not pusblished');
        }

        const comment = {
            id: uuid4(),
            ...args.data
        }

        console.log(comment);

        db.comments.push(comment);
        pubsub.publish(`comment ${post}`,{comment})

        return comment;
    },
    deleteComment(parent,args,{db},info){
        const {id} = args;
        const commentIndex = db.comments.findIndex((comment)=> comment.id === id);

        if( commentIndex === -1){
            throw new Error('Unable to find the comment.')
        }

        const deletedComment = db.comments.splice(commentIndex,1);

        return deletedComment[0];
    },
    updateComment(parent,args,{db},info){
        const {id,data} = args;
        const comment = db.comments.find(comment=> comment.id === id);

        if(!comment){
            throw new Error('Comment not found');
        }

        if(typeof data.text === 'string'){
            comment.text = data.text
        }

        return comment;
    }
}

export {Mutation as default};