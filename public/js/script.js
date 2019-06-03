(function() {
    Vue.component("modal", {
        template: "#modal-template",
        props: ["img_id"],
        data: function() {
            return {
                url: "",
                username: "",
                title: "",
                description: "",
                uploadTime: "",
                comments: [],
                comment: {
                    text: "",
                    name: ""
                }
            };
        },
        mounted: function() {
            const self = this;
            axios
                .get("/image/" + self.img_id)
                .then(function(results) {
                    self.url = results.data[0].url;
                    self.title = results.data[0].title;
                    self.description = results.data[0].description;
                    self.username = results.data[0].username;
                    self.uploadTime = results.data[0].created_at.slice(0, 10);
                })
                .then(function() {
                    axios
                        .get("/image/" + self.img_id + "/comments")
                        .then(function(results) {
                            if (results.data.length > 0) {
                                for (let i = 0; i < results.data.length; i++) {
                                    self.comments.unshift(results.data[i]);
                                }
                            }
                        });
                });
        }, //closes mounted
        methods: {
            addImageComment: function(e) {
                e.preventDefault();
                var self = this;
                axios
                    .post("/comment/" + self.img_id + "/add", {
                        text: self.comment.text,
                        name: self.comment.name
                    })
                    .then(function(results) {
                        self.comments.unshift(results.data[0]);
                        self.comment.text = "";
                        self.comment.name = "";
                    });
            }
        }
    });
})();

// calling constructor and getting instance(object representing our app)
new Vue({
    el: "#main",
    //element with the id main
    data: {
        img_id: false,
        images: [],
        more: true,

        form: {
            title: "",
            name: "",
            description: "",
            file: null //as default value
        }
    },
    mounted: function() {
        const self = this; //because of a nested function then(), 'this' would lose it's purpose, that's why we need const self = this;
        axios.get("/images").then(function(response) {
            //.then runs when we get resposne from server
            //when there is something in the image array, v-for in html runs: loops and renders pictures.
            self.images = response.data; //why not response.data.images?
            if (self.images[self.images.length - 1].id == 1) {
                self.more = false;
            }
            // if == )
        });
    }, //mounted ends here

    methods: {
        //here only functions associated with main;
        uploadFile: function(e) {
            //znaci (event)
            const self = this;
            e.preventDefault();
            var file = document.getElementById("file");
            var uploadedFile = file.files[0];

            //we want to send uploadedFile to the server
            //we have to use api called formData:
            var formData = new FormData();
            formData.append("name", this.form.name);
            formData.append("title", this.form.title);
            formData.append("description", this.form.description);
            formData.append("file", uploadedFile); //this is adding object, with property 'file', and value uploadedFile

            //sending formData to the server as part of the request
            axios
                .post("/upload", formData)
                .then(function(respond) {
                    self.images.unshift(respond.data);
                })
                .catch(err => {
                    console.log("Error in uploadFile: ", err);
                });

            //lines below clear the input-fields after upload

            this.form.name = "";
            this.form.title = "";
            this.form.description = "";
            file.value = "";
        },
        showModal: function(img_id) {
            this.img_id = img_id;
        },
        hideModal: function() {
            this.img_id = null;
        },
        seeMore: function() {
            axios
                .post("/more", {
                    lastId: this.images[this.images.length - 1].id
                })
                .then(
                    function(result) {
                        if (this.images[this.images.length - 1].id == 7) {
                            this.more = false;
                        }
                        this.images = this.images.concat(result.data.rows);
                    }.bind(this)
                );
        }
    } //end methods
});
