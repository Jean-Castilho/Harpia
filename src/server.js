import pages from "#src/routes/pages.js";
import auth from "#src/routes/auth.js";
import orders from "#src/routes/orders.js";
import products from "#src/routes/products.js";
import admin from "#src/routes/admin.js";

const Server = function (app) {
    app.use("/", pages);
    app.use("/auth", auth);
    app.use("/orders", orders);
    app.use("/products", products);
    app.use("/admin", admin);
};

export default Server;