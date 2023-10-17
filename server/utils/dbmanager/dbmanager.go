package dbmanager

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func DbConnection() *sql.DB {
	// DB connection
	dbUser := GoDotEnvVariable("DB_USER")
	dbPassword := GoDotEnvVariable("DB_PASSWORD")
	db, err := sql.Open("mysql", dbUser+":"+dbPassword+"@tcp(127.0.0.1:3306)/my_go_db")
	if err != nil {
		panic(err.Error())
	}
	return db
}

func GoDotEnvVariable(key string) string {
	err := godotenv.Load("../database/.env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
	return os.Getenv(key)
}
