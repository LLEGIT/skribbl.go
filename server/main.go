package main

import (
	"log"
	"server/ws"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {
	// ENV
	err := godotenv.Load("../database/.env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// ROUTER
	router := gin.Default()
	router.GET("/ws", ws.Endpoint)

	router.Run("localhost:8080")
}
