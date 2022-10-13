const dummy = (blogs) =>{
    return 1
}

const totalLikes = (blogs) =>{
    const likes = blogs.map(b=> b.likes)

    return blogs.length ===0
        ? 0
        : likes.reduce((a,v) =>{ return a+v},0)
}

const favoriteBlog = (blogs) =>{
    const likes = blogs.map(b=> b.likes)
    const favorite = likes.indexOf(Math.max(...likes))
    
    return blogs[favorite]
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}