# A REST API for the [confusion-client-react](https://github.com/minsoeaung/confusion-client-react) to access backend services

## Built with
- [nodejs](https://nodejs.org/en/)
- [expressjs](https://expressjs.com/)
- [passportjs](http://www.passportjs.org/)
- [mongodb](https://www.mongodb.com/)


## Supported API Endpoints
###`/dishes`
###`/dishes/:dishId`
###`/promotions`
###`/promotions/:promoId` 
###`/leaders`
###`/leaders/:leaderId`
###`/favorites`
###`/favorites/:dishId`
###`/comments`
###`/comments/:commentId`
###`/users`
###`/users/signup`
###`/users/login`
###`/users/logout`
###`/users/facebook/token`
###`/users/checkJWTToken`

## Setup & Usage
1. Clone this repo and go to project directory
2. Run `npm install` and wait installing its dependencies
3. Start a mongodb server ([help](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/))
    - example -> `mongod --dbpath=path/to/db --bind_ip 127.0.0.1`
4. Run `npm start` to start the server