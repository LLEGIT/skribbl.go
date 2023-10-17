# skribbl.go

This project is an adaptation of the famous drawing game. <br>

To setup the project, you will need Node.js, Docker and Goland installed on your device.

Steps:
- Cd in `/app` and exec `npm install`, then `npm start`
- Cd in `../database`:
    - create a `.env` file in the folder containing the required infos of the `docker-compose`` file
    - execute `docker-compose up -d` in the folder
    - Execute in the database the sql script named `my_go_db_dump.sql`, located in the folder
- Cd in `../server` and execute `go run .`

You're good to go !