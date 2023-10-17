package wordmanager

import (
	"database/sql"
	"server/utils/dbmanager"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

func GetThreeWords() ([]string, error) {
	db := dbmanager.DbConnection()

	query := "SELECT DISTINCT word FROM word ORDER BY RAND() LIMIT 3"

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var words []string

	for rows.Next() {
		var word string
		if err := rows.Scan(&word); err != nil {
			return nil, err
		}
		words = append(words, word)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return words, nil
}
