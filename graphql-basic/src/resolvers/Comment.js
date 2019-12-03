const Comment = {
    author(parent,args,{db},info){
        const user = db.users.find((user)=>user.id === parent.author)
        console.log(user);
        return user;
    },
    post(parent,args,{db},info){
        const post =  db.posts.find((post)=>post.id === parent.post)    
        console.log(post)
        return post;

    }
};

export {Comment as default}