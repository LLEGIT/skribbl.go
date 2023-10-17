package roommanager

import (
	"context"
	"database/sql"
	"log"
	"math/rand"
	"server/models"
	"server/player/playermanager"
	"server/utils/dbmanager"

	// "server/room/wordmanager"
	"errors"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func CreateRoom(room models.Room) models.Room {
	db = dbmanager.DbConnection()
	// Fetch all rooms first
	existingRooms, allRoomsErr := GetAllRooms()
	if allRoomsErr != nil {
		log.Println("Couldn't fetch all rooms", allRoomsErr)
	}

	// Generate room name
	var roomName string
	for {
		roomName = GenerateRandomName()
		if IsNameUnique(roomName, existingRooms) {
			break
		}
	}
	room.Name = roomName
	room.ID = GetLastAvailableID(existingRooms)
	InsertNewRoom(db, room)

	// Insert player
	playermanager.CreateAdmin(room)

	// Success
	defer db.Close()
	return room
}

func GetRoom(id int) (models.Room, error) {
	db := dbmanager.DbConnection()

	// Query to get room details
	roomQuery := "SELECT room.*, room_drawing.src FROM room LEFT JOIN room_drawing ON room.id = room_drawing.room_id WHERE room.id = ?"
	roomRow := db.QueryRow(roomQuery, id)

	var room models.Room

	if err := roomRow.Scan(
		&room.ID,
		&room.Name,
		&room.PlayersNumber,
		&room.DrawTime,
		&room.RoundsNumber,
		&room.CurrentWord,
		&room.IsPrivate,
		&room.CreatedAt,
		&room.CurrentRound,
		&room.Src); err != nil {
		return models.Room{}, err
	}

	// Get players for the current room using GetPlayersByRoom
	players, err := GetPlayersByRoom(id)
	if err != nil {
		return models.Room{}, err
	}

	// Append players to the CurrentPlayers field
	room.CurrentPlayers = players

	return room, nil
}

func InsertNewRoom(db *sql.DB, room models.Room) error {
	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return err
	}

	// Query & execution
	insertQuery := "INSERT INTO room (id, name, players_number, draw_time, rounds, is_private) VALUES (?, ?, ?, ?, ?, ?)"
	_, err = tx.Exec(insertQuery, room.ID, room.Name, room.PlayersNumber, room.DrawTime, room.RoundsNumber, false)
	if err != nil {
		// Stop transaction if error
		tx.Rollback()
		log.Println("Room couldn't be created", err)
		return err
	}

	// Commit when it's done
	err = tx.Commit()
	if err != nil {
		log.Println("Error committing transaction:", err)
		return err
	}
	return nil
}

func InsertWord(id int, word string) (bool, error) {
	db := dbmanager.DbConnection()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return false, err
	}

	// Query & execution
	insertQuery := "UPDATE room SET current_word = ? WHERE id = ?"
	_, err = tx.Exec(insertQuery, word, id)
	if err != nil {
		// Stop transaction if error
		tx.Rollback()
		log.Println("Word couldn't be inserted", err)
		return false, err
	}

	// Commit when it's done
	err = tx.Commit()
	if err != nil {
		log.Println("Error committing transaction:", err)
		return false, err
	}
	return true, nil
}

func GetAllRooms() ([]models.Room, error) {
	db := dbmanager.DbConnection()

	// First, delete old rooms
	DeleteOldRooms()

	query := "SELECT room.id, room.name, room.players_number, room.draw_time, room.rounds, room.is_private, room.created_at, room.current_round, player.username, player.avatar_id, player.is_admin FROM room LEFT JOIN player ON room.id = player.room_id"

	rows, err := db.Query(query)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []models.Room
	roomMap := make(map[int]models.Room)

	for rows.Next() {
		var room models.Room
		var player models.Player

		if err := rows.Scan(&room.ID, &room.Name, &room.PlayersNumber, &room.DrawTime, &room.RoundsNumber, &room.IsPrivate, &room.CreatedAt, &room.CurrentRound, &player.Username, &player.AvatarID, &player.IsAdmin); err != nil {
			return rooms, err
		}

		// Check if the room is already in the map
		if existingRoom, ok := roomMap[room.ID]; ok {
			// If yes, append the player to the existing room
			existingRoom.CurrentPlayers = append(existingRoom.CurrentPlayers, player)
			roomMap[room.ID] = existingRoom
		} else {
			// If no, create a new entry in the map
			room.CurrentPlayers = append(room.CurrentPlayers, player)
			roomMap[room.ID] = room
		}
	}

	// Convert the map to a slice of rooms
	for _, r := range roomMap {
		rooms = append(rooms, r)
	}

	return rooms, nil
}

// use godot package to load/read the .env file and
// return the value of the key
func GenerateRandomName() string {
	const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	rand.Seed(time.Now().UnixNano())

	var result string
	for i := 0; i < 7; i++ {
		index := rand.Intn(len(alphabet))
		result += string(alphabet[index])
	}

	return result
}

func IsNameUnique(name string, rooms []models.Room) bool {
	for _, room := range rooms {
		if room.Name == name {
			return false
		}
	}
	return true
}

func DeleteOldRooms() error {
	db := dbmanager.DbConnection()
	query := "SELECT * FROM room"
	rows, err := db.Query(query)

	if err != nil {
		return err
	}
	defer rows.Close()

	// Check if the room is older than 48 hours
	limit := time.Now().Add(-48 * time.Hour).Unix()
	// Potential layouts used for parsing
	layouts := []string{
		"2006-01-02 15:04:05",
	}

	for rows.Next() {
		var room models.Room
		err := rows.Scan(&room.ID, &room.Name, &room.PlayersNumber, &room.DrawTime, &room.RoundsNumber, &room.CurrentWord, &room.IsPrivate, &room.CreatedAt)
		if err != nil {
			return err
		}
		// Try to parse CreatedAt with different layouts
		var createdAtTime time.Time
		var parseError error
		for _, layout := range layouts {
			createdAtTime, parseError = time.Parse(layout, room.CreatedAt)
			if parseError == nil {
				break
			}
		}

		if err != nil {
			log.Println("Error parsing CreatedAt:", err)
			// Handle the error as needed
			continue
		}

		// Check if the room is older than 72 hours
		if createdAtTime.Unix() < limit {
			// Delete the room from the database
			deleteQuery := "DELETE FROM room WHERE id = ?"
			_, err := db.Exec(deleteQuery, room.ID)
			if err != nil {
				log.Println("Error deleting room:", err)
				// You might want to handle the error or continue with other rooms
			}
		}

		// TODO: Check if the room is empty
		// TODO: fix error Cannot delete or update a parent row: a foreign key constraint fails
	}

	if err := rows.Err(); err != nil {
		return err
	}

	return nil
}

func GetLastAvailableID(rooms []models.Room) int {
	var maxID int
	for _, room := range rooms {
		if room.ID > maxID {
			maxID = room.ID
		}
	}
	return maxID + 1
}

func GetPlayersByRoom(id int) ([]models.Player, error) {
	db := dbmanager.DbConnection()
	query := "SELECT * FROM player WHERE room_id = ?"
	rows, err := db.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var players []models.Player

	for rows.Next() {
		var player models.Player
		if err := rows.Scan(&player.ID, &player.Username, &player.RoomID, &player.AvatarID, &player.CreatedAt, &player.IsAdmin, &player.Score, &player.FoundWord, &player.IsDrawing); err != nil {
			return players, err
		}
		players = append(players, player)
	}

	return players, nil
}

func JoinRoom(roomName string, avatar int, nickname string) (int, error) {
	db := dbmanager.DbConnection()
	var room models.Room
	// Get the room ID to return it
	query := "SELECT * FROM room WHERE name = ?"
	request := db.QueryRow(query, roomName)
	err := request.Scan(&room.ID, &room.Name, &room.PlayersNumber, &room.DrawTime, &room.RoundsNumber, &room.CurrentRound, &room.CurrentWord, &room.IsPrivate, &room.CreatedAt)

	if err == sql.ErrNoRows {
		return room.ID, err
	}

	// Check if the room is already full
	players, err := GetPlayersByRoom(room.ID)
	if err != nil {
		return 0, err
	}
	if len(players) >= room.PlayersNumber {
		return 0, errors.New("room is full")
	}

	// Add the player to room's players list
	playerCreation, playerCreationErr := playermanager.CreatePlayer(room, avatar, nickname)
	if !playerCreation && playerCreationErr == sql.ErrNoRows {
		return room.ID, playerCreationErr
	}

	return room.ID, err
}

func SaveDrawing(src string, roomId int) (int64, error) {
	db := dbmanager.DbConnection()

	// Attempt to insert a new row. If a row with the same roomId already exists, it will be updated.
	query := "INSERT INTO `room_drawing` (`src`, `room_id`) VALUES(?, ?) ON DUPLICATE KEY UPDATE `src` = VALUES(`src`), `room_id` = VALUES(`room_id`)"

	insertResult, err := db.ExecContext(context.Background(), query, src, roomId)

	if err != nil {
		log.Fatalf("impossible to insert or update drawing: %s", err)
	}
	defer db.Close()

	id, err := insertResult.LastInsertId()
	if err != nil {
		log.Fatalf("impossible to retrieve the last inserted id: %s", err)
	}

	return id, err
}

func UpdateRound(roomId int) (int64, error) {
	db := dbmanager.DbConnection()

	query := "SELECT `id`, `rounds`, `current_round` FROM `room` WHERE `id` = ?"

	roomRow := db.QueryRow(query, roomId)

	var room models.Room

	err := roomRow.Scan(&room.ID, &room.RoundsNumber, &room.CurrentRound)

	if err != nil {
		return 0, err
	}

	// Step 2: Check if the current round is equal to rounds
	if room.CurrentRound == room.RoundsNumber {
		return 0, errors.New("The current room has reached the maximum number of rounds")
	}

	query2 := "UPDATE `room` SET `current_round` = `current_round` + 1 WHERE `id` = ?"

	updatedResult, err := db.ExecContext(context.Background(), query2, roomId)

	if err != nil {
		log.Fatalf("impossible to update round: %s", err)
	}

	query3 := "SELECT * FROM `player` WHERE `room_id` = ? AND `is_drawing` = 0 LIMIT 1"
	query4 := "UPDATE `player` SET `is_drawing` = 0 WHERE `room_id` = ? AND `is_drawing` = 1"

	_, err = db.ExecContext(context.Background(), query4, roomId)

	if err != nil {
		log.Fatalf("impossible to update player: %s", err)
	}

	playerRow := db.QueryRow(query3, roomId)

	var player models.Player

	err = playerRow.Scan(&player.ID, &player.Username, &player.RoomID, &player.AvatarID, &player.CreatedAt, &player.IsAdmin, &player.Score, &player.FoundWord, &player.IsDrawing)

	if err != nil {
		return 0, err
	}

	defer db.Close()

	id, err := updatedResult.LastInsertId()

	return id, err
}

func DeleteRoom(roomId int) (bool, error) {
	db := dbmanager.DbConnection()

	query := "DELETE FROM `room` WHERE `id` = ?"

	_, err := db.ExecContext(context.Background(), query, roomId)

	if err != nil {
		log.Fatalf("impossible to delete room: %s", err)
	}
	defer db.Close()

	return true, err
}
