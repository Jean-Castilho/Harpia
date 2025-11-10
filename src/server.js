import pages from "./routes/pages.js";
import users from "./routes/user.js";


const Server = function (app) {

    

    app.use("/", pages);
    app.use("/users", users);

}

export default Server;
