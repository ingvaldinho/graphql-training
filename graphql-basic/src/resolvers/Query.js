const Query = {
    me(){
        return db.users[0];
    },
    users(parent,args,{db},info){
        console.log(args.query);
        if(!args.query){
            return db.users;
        }

        return db.users.filter((user)=>{
            return user.name.toLowerCase().includes(args.query.toLowerCase()) 
        })
    },
    post(){
        return db.posts[0]
    },
    posts(parent,args,{db},info){
        if(!args.query){
            return db.posts
        }

        return db.posts.filter((post)=>{
            return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
        })
    },
    comments(paren,args,{db},info){
        return db.comments
    }
}

export {Query as default};