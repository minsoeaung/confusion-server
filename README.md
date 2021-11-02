# A REST API for the [confusion-client-react](https://github.com/minsoeaung/confusion-client-react) to access backend services

## Built with
- [NodeJs](https://nodejs.org/en/)
- [ExpressJs](https://expressjs.com/)
- [PassportJs](http://www.passportjs.org/)
- [MongooseJs](https://mongoosejs.com/)
- and more


## Supported API Endpoints
#### `/dishes`
#### `/dishes/:dishId`
#### `/promotions`
#### `/promotions/:promoId` 
#### `/leaders`
#### `/leaders/:leaderId`
#### `/favorites`
#### `/favorites/:dishId`
#### `/comments`
#### `/comments/:commentId`
#### `/users`
#### `/users/signup`
#### `/users/login`
#### `/users/logout`

## Setup & Usage
1. clone this repository
   - `git clone https://github.com/minsoeaung/confusion-server`
2. in the project directory
   - Run `npm install` and wait installing its dependencies
3. run a Mongodb Server by following its [guide](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/)
   - example: `mongod --dbpath=path/to/db --bind_ip 127.0.0.1`
4. change mongoUrl's value in config.js file for the server to know where the database is running
   - example: `'mongoUrl': 'mongodb://localhost:27017/conFusion`
5. run `npm start` to start the server