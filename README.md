# iFarmo Backend API

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
