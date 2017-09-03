# ESP Game


# How to run this activity

  - You should have Node.js (v6 or above) , MongoDB (v3 or above) Installed on your local system. 
  - Clone this repository, open command prompt and change the directory to the location where you have downloaded this repository and open the folder.
  - Start database by the the following command, it usually starts at port 27017, if is starts at some other port you need to change the port number in the "dbConnectionString" value in keys/config.json file.
    ```sh
    mongod
    ```
  - To start the application type following command in a new command prompt,the application will start at port 5000, Open http://localhost:5000
    ```sh
    node index.js
    ```

  - You need to initialize the images in the database once, Follow these steps
  - Hit the following url and all the images will be initialized into the db
    ```sh
    http://localhost:5000/initialize
    ```
  - The application is ready to use now.


