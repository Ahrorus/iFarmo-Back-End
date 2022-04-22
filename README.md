# iFarmo API

This is a repository that contains necessary project files for the iFarmo's backend server. The server is deployed on Heroku, and its API calls are accessible via link:

https://nodejs-ifarmo.herokuapp.com/api/


# iFarmo API Local Installation

## Preparing local environment
1. Install npm (node package manager) https://nodejs.org/en/download/.
2. Install VSCode with plugin "Prettier".
3. Install Postman for API testing.
4. [Optional] Install desired VSCode plugins to easen your coding.
5. [Optional] Install GitHub Desktop.

## Setup MongoDB Atlas 
1. Create a MongoDB account.
2. Create a project, a cluster, and a database for this app, or request to be added to an existing cloud database.
3. In the specified cluster, click **Connect**, then choose **Connect to your cloud application**, copy the connection link, replace the necessary keywords, and add that link to the **.env** file (later in the next section).

## Launch and test the server locally
1. Open terminal in the project's folder.
2. Install required packages using ```npm ci```.
`Note`: You may use ```npm install <your_module>``` to install additional modules but do NOT use ```npm install``` to install required modules listed in package.json to avoid version conflicts, and instead use ```npm ci``` in those cases. For more information, check here: https://stackoverflow.com/questions/48524417/should-the-package-lock-json-file-be-added-to-gitignore.~~
3. Create **.env** file in the project's folder and add your database connection link using username and password for the MongoDB database (reference to the section above), Token secret, and Port number like so:
    ```
    DB_CONNECTION = ...
    TOKEN_SECRET = ...
    PORT = ... ```
4. Run ```npm start``` to run the server.

# iFarmo API Documentation

Use the API on localhost or the one deployed on Heroku (https://nodejs-ifarmo.herokuapp.com/api/) to make requests.

## Authentication

```
POST: /api/auth/register
body: {
    "username": "min=8, max=30",
    "password": "min=8, max=30",
    "name": "min=2, max=30",
    "email": "min=8, max=30, email"
}
response: {
    "user": "new_user_id"
}

POST: /api/auth/login
body: {
    "login": "min=8, max=30, either email or username, must exist",
    "password": "min=8, max=30"
}
response: new_jwt_token_generated_from_user_id
header of the response: auth-token field
}
```

## Users

```
GET: /api/users
response: {all users}

GET: /api/users/:userId
header: pass the auth-token of any user (meaning, user needs to be logged in)
no body expected
response: {user object}

PUT: /api/users/:userId
header: pass the auth-token of the same user (meaning, user needs to be logged in and it has to be the same user)
body: {
    "name": "min=8, max=30",
    "role": "farmer", (keep this as "farmer" by default)
    "bio": "min=0, max=250",
    "contactInfo": "+16969696969, min=8, max=20"
}
response: {updated user object}

DELETE: /api/users/:userId
header: pass the auth-token of the same user
response: {removed user object}
```

## Products

```
GET: /api/products
params: {
    "searchKey": "someSearchWord",
    "filter": "date_asc OR date_desc" 
}
response: {all products}

GET: /api/products/:productId
no body expected
response: {product object}

POST: /api/products/:productId
header: pass the auth-token of any user (has to be farmer)
body: {
    "name": "min=2, max=20",
    "type": "min=2, max=10",
    "desc": "min=0, max=250",
    "quantity": "number",
    "unit_type": "lbs OR kg OR g OR piece",
    "price": "number"
}
response: {"product": "new_product_id"}

PUT: /api/products/:productId
header: pass the auth-token of the same user (meaning, user needs to be logged in, the user is farmer, and it has to be the same user)
body: {
    "name": "min=2, max=20",
    "type": "min=2, max=10",
    "desc": "min=0, max=250",
    "quantity": "number",
    "unit_type": "lbs OR kg OR g OR piece",
    "price": "number"
}
response: {updated product object}

DELETE: /api/products/:productId
header: pass the auth-token of the same user (has to be farmer)
response: {removed product object}
```
