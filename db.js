const spicedPg = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    //const { dbUser, dbPassword } = require("./secrets");
    db = spicedPg(`postgres:webuser:webuser@localhost:5432/imageboard`);
}

module.exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 5`);
};

module.exports.addImage = function(username, title, description, url) {
    return db.query(
        `INSERT INTO images (username, title, description, url)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [username, title, description, url]
    );
};

module.exports.getImageData = function(img_id) {
    return db.query(
        `SELECT * FROM images
    WHERE id = $1`,
        [img_id]
    );
};

module.exports.getImageComments = function(img_id) {
    return db.query(
        `
        SELECT * FROM comments
        WHERE img_id =$1`,
        [img_id]
    );
};

module.exports.addImageComment = function(name, text, img_id) {
    return db.query(
        `INSERT INTO comments (username, comment, img_id)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [name, text, img_id]
    );
};

module.exports.getMoreImages = lastId =>
    db.query(
        `SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 5`,
        [lastId]
    );
