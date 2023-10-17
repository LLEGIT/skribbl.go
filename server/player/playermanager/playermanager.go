package playermanager

import (
	"database/sql"
	"log"
	"server/models"
	"server/utils/dbmanager"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func CreateAdmin(room models.Room) (bool, error) {
	db = dbmanager.DbConnection()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return false, err
	}

	isUsernameFree, usernameErr := UsernameAlreadyExists(room.Username)
	if usernameErr != nil {
		log.Println("Error checking username:", usernameErr)
		return false, err
	}

	if isUsernameFree {
		// Query & execution
		insertQuery := "INSERT INTO player (username, room_id, avatar_id, is_admin, score, found_word, is_drawing) VALUES (?, ?, ?, ?, ?, ?, true)"
		_, err = tx.Exec(insertQuery, room.Username, room.ID, room.PlayerAvatar, true, 0, false)
		if err != nil {
			// Stop transaction if error
			tx.Rollback()
			log.Println("Admin couldn't be created", err)
			return false, err
		}

		// Commit when it's done
		err = tx.Commit()
		if err != nil {
			log.Println("Error committing transaction:", err)
			return false, err
		}
	}

	return true, nil
}

func CreatePlayer(room models.Room, avatar int, nickname string) (bool, error) {
	db = dbmanager.DbConnection()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return false, err
	}

	isUsernameFree, usernameErr := UsernameAlreadyExists(nickname)
	if usernameErr != nil {
		log.Println("Error checking username:", usernameErr)
		return false, err
	}

	if isUsernameFree {
		// Query & execution
		insertQuery := "INSERT INTO player (username, room_id, avatar_id, is_admin, score, found_word) VALUES (?, ?, ?, ?, ?, ?)"
		_, err = tx.Exec(insertQuery, nickname, room.ID, avatar, false, 0, false)
		if err != nil {
			// Stop transaction if error
			tx.Rollback()
			log.Println("Player couldn't be created", err)
			return false, err
		}

		// Commit when it's done
		err = tx.Commit()
		if err != nil {
			log.Println("Error committing transaction:", err)
			return false, err
		}
	}

	return true, nil
}

func UsernameAlreadyExists(nickname string) (bool, error) {
	db = dbmanager.DbConnection()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return false, err
	}

	// Check if the player already exists
	existsQuery := "SELECT COUNT(*) FROM player WHERE username = ?"
	var count int
	err = tx.QueryRow(existsQuery, nickname).Scan(&count)
	if err != nil {
		// Stop transaction if error
		tx.Rollback()
		log.Println("Error checking player existence:", err)
		return false, err
	}

	if count > 0 {
		// Player already exists, return without creating a new one
		log.Println("Player already exists.")
		return false, nil
	}
	return true, nil
}

func QuitRoom(id int, username string) error {
	db := dbmanager.DbConnection()
	query := "DELETE FROM player WHERE room_id = ? AND username = ?"

	_, err := db.Exec(query, id, username)
	if err != nil {
		log.Println("Error deleting player by room:", err)
		return err
	}

	queryPlayerCount := "SELECT COUNT(*) FROM player WHERE room_id = ?"
	var count int
	err = db.QueryRow(queryPlayerCount, id).Scan(&count)
	if err != nil {
		log.Println("Error checking player count:", err)
		return err
	}

	if count == 0 {
		queryDeleteRoom := "DELETE FROM room WHERE id = ?"
		_, err = db.Exec(queryDeleteRoom, id)
		if err != nil {
			log.Println("Error deleting room:", err)
			return err
		}
	}

	return nil
}

func GetCurrentRoomByPlayer(username string) (models.Room, error) {
	db := dbmanager.DbConnection()
	var room models.Room

	query := `SELECT room.id, room.name FROM room JOIN player ON room.id = player.room_id WHERE player.username = ?`

	request := db.QueryRow(query, username)
	err := request.Scan(&room.ID, &room.Name)

	if err != nil {
		return models.Room{}, err
	}

	return room, nil
}

func UpdateScoreAndFoundWord(username string) (bool, error) {
	db := dbmanager.DbConnection()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return false, err
	}

	// Query & execution
	insertQuery := "UPDATE player SET score = score + 1, found_word = true WHERE username = ?"
	_, err = tx.Exec(insertQuery, username)
	if err != nil {
		// Stop transaction if error
		tx.Rollback()
		log.Println("Score couldn't be updated", err)
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

func ResetAllRoomPlayersFoundWord(roomID int) (bool, error) {
	db := dbmanager.DbConnection()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		log.Println("Error starting transaction:", err)
		return false, err
	}

	// Query & execution
	insertQuery := "UPDATE player SET found_word = false WHERE room_id = ?"
	_, err = tx.Exec(insertQuery, roomID)
	if err != nil {
		// Stop transaction if error
		tx.Rollback()
		log.Println("Score couldn't be updated", err)
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
