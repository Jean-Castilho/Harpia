import pages from "./routes/pages.js";
import auth from "./routes/auth.js";
import products from "./routes/products.js"


const Server = function (app) {

    app.use("/", pages);
    app.use("/auth", auth);
    app.use("/products", products);

}

export default Server;
