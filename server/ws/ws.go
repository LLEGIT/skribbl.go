package ws

import (
	"encoding/json"
	// "fmt"
	"log"
	"net/http"
	"reflect"
	"server/models"
	"server/player/playermanager"
	"server/room/roommanager"
	"server/room/wordmanager"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ClientRoom struct {
	ID   int
	Conn *websocket.Conn
	send chan []byte
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var roomClients = make(map[int][]*ClientRoom) // connected clients

func Endpoint(c *gin.Context) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	socket, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("endPointError", err)
	}
	reader(socket)
}

func reader(conn *websocket.Conn) {
	for {
		var msg models.Data
		// read in a message
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("readerError", err, messageType, p)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("closeError", err)
				removeRoomIDForClient(conn)
			}
			return
		}

		if err := json.Unmarshal(p, &msg); err != nil {
			log.Println("Unmarshal error: ", err)
			continue // Skip this message if it's not valid JSON
		}

		switch msg.Type {
		case "text":
			// Handle text message
			roomID := getRoomIDForClient(conn)
			sendToRoom(roomID, messageType, p, conn)
		case "canvas":
			roomID := getRoomIDForClient(conn)
			roommanager.SaveDrawing(msg.Data, roomID)
			sendToRoom(roomID, messageType, p, conn)
		case "roomCreation":
			// Handle room creation
			createdRoom := roommanager.CreateRoom(msg.Room)

			// Send the createdRoom back
			responseMsg := models.Data{
				Type:    "createdRoom",
				Message: "Room created successfully",
				Room:    createdRoom,
			}

			responseJSON, err := json.Marshal(responseMsg)
			if err != nil {
				log.Println("JSON Marshal error:", err)
				continue
			}

			if err := conn.WriteMessage(messageType, responseJSON); err != nil {
				log.Println(err)
				return
			}
		case "getRoom":
			room, queryError := roommanager.GetRoom(msg.RoomID)

			if !reflect.DeepEqual(room, models.Room{}) {
				// Send the createdRoom back
				responseMsg := models.Data{
					Type:    "getRoom",
					Message: "Room informations",
					Room:    room,
				}

				responseJSON, err := json.Marshal(responseMsg)

				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				setRoomIDForClient(conn, msg.RoomID)

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
					return
				}
			} else {
				responseMsg := models.Data{
					Type:    "getRoom",
					Message: "Room informations Error",
					Empty:   queryError,
				}

				responseJSON, err := json.Marshal(responseMsg)

				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
					return
				}
			}
		case "getAllRooms":
			rooms, error := roommanager.GetAllRooms()

			if len(rooms) != 0 {
				responseMsg := models.Data{
					Type:    "getRoom",
					Message: "Room informations",
					Rooms:   rooms,
				}

				responseJSON, err := json.Marshal(responseMsg)

				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
					return
				}
			} else {
				responseMsg := models.Data{
					Type:    "getRoom",
					Message: "Room informations",
					Empty:   error,
				}

				responseJSON, err := json.Marshal(responseMsg)

				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
					return
				}
			}

		case "checkPlayerRoom":
			room, queryError := playermanager.GetCurrentRoomByPlayer(msg.Nickname)

			if room.ID != 0 {
				responseMsg := models.Data{
					Type:    "checkPlayerRoom",
					Message: "Room found for player",
					Room:    room,
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}
				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
					return
				}
			} else {
				responseMsg := models.Data{
					Type:    "checkPlayerRoom",
					Message: "Room not found",
					Empty:   queryError,
				}

				responseJSON, err := json.Marshal(responseMsg)

				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
					return
				}
			}
		case "joinRoom":
			roomID, queryError := roommanager.JoinRoom(msg.RoomName, msg.PlayerAvatar, msg.Nickname)

			// Send the joinedRoom back
			if queryError != nil {
				responseMsg := models.Data{
					Type:    "joinedRoomError",
					Message: "Join Room Error",
					Empty:   queryError,
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}
				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
					return
				}
			} else {
				responseMsg := models.Data{
					Type:    "joinedRoom",
					Message: "Room ID",
					RoomID:  roomID,
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				alertPlayers := models.Data{
					Type:    "playerJoined",
					Message: "Player joined",
					Nickname: msg.Nickname,
				}

				alertPlayersJSON, err := json.Marshal(alertPlayers)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}

				sendToRoom(roomID, messageType, alertPlayersJSON, conn)
			}
			return
		case "leaveRoom":
			queryError := playermanager.QuitRoom(msg.RoomID, msg.Nickname)

			if queryError != nil {
				responseMsg := models.Data{
					Type:    "leaveRoomError",
					Message: "Leave Room Error",
					Empty:   queryError,
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}
				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}
			} else {
				responseMsg := models.Data{
					Type:    "leaveRoomSuccess",
					Message: "Leave Room Success",
					Nickname: msg.Nickname,
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}
				removeRoomIDForClient(conn)
				sendToRoom(msg.RoomID, messageType, responseJSON, conn);
			}
		case "getWords":
			words, queryError := wordmanager.GetThreeWords()
			if queryError != nil {
				// Handle the error and send an error response to the client
				responseMsg := models.Data{
					Type:    "ThreeWordsError",
					Message: "Words Error",
					Empty:   queryError, // Send the error message to the client
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}
			} else {
				// Send the words to the client
				responseMsg := models.Data{
					Type:    "ThreeWords",
					Message: "Words",
					Words:   words,
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}
				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}
			}
		case "setWord":
			_, queryError := roommanager.InsertWord(msg.RoomID, msg.Word)
			if queryError != nil {
				// Handle the error and send an error response to the client
				responseMsg := models.Data{
					Type:    "setWordError",
					Message: "Set Word Error",
					Empty:   queryError, // Send the error message to the client
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}
			} else {
				// Send the words to the client
				responseMsg := models.Data{
					Type:    "setWordSuccess",
					Message: "Set Word Success",
					Word:    msg.Word,
				}

				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				sendToRoom(msg.RoomID, messageType, responseJSON, conn)
			}
		case "userFoundWord":
			_, queryError := playermanager.UpdateScoreAndFoundWord(msg.Nickname)
			if queryError != nil {
				// Handle the error and send an error response to the client
				responseMsg := models.Data{
					Type:    "userFoundWordError",
					Message: "Update Score And Found Word Error",
					Empty:   queryError, // Send the error message to the client
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}
			} else {
				// Send the words to the client
				responseMsg := models.Data{
					Type:     "userFoundWordSuccess",
					Message:  "Update Score And Found Word Success",
					Nickname: msg.Nickname,
				}

				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				sendToRoom(msg.RoomID, messageType, responseJSON, conn)
			}
		case "startNewRound":
			roommanager.UpdateRound(msg.RoomID)
			_, queryError := playermanager.ResetAllRoomPlayersFoundWord(msg.RoomID)
			if queryError != nil {
				// Handle the error and send an error response to the client
				responseMsg := models.Data{
					Type:    "resetAllRoomPlayersFoundWordError",
					Message: "Reset All Room Players Found Word Error",
					Empty:   queryError, // Send the error message to the client
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}
			} else {

				_, errUpdateRoom := roommanager.UpdateRound(msg.RoomID)

				if errUpdateRoom != nil {
					log.Println("Error going to next round", errUpdateRoom)
				}

				room, queryError := roommanager.GetRoom(msg.RoomID)

				if queryError != nil {
					// Handle the error and send an error response to the client
					responseMsg := models.Data{
						Type:    "getRoomError",
						Message: "Get Room Error",
						Empty:   queryError, // Send the error message to the client
					}
					responseJSON, err := json.Marshal(responseMsg)
					if err != nil {
						log.Println("JSON Marshal error:", err)
						continue
					}

					if err := conn.WriteMessage(messageType, responseJSON); err != nil {
						log.Println(err)
					}
				}

				// Send the words to the client
				responseMsg := models.Data{
					Type:    "newRound",
					Message: "New round start",
					Room:    room,
				}

				responseJSON, err := json.Marshal(responseMsg)

				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				sendToRoom(msg.RoomID, messageType, responseJSON, conn)
			}
		case "deleteRoom":
			_, queryError := roommanager.DeleteRoom(msg.RoomID)
			if queryError != nil {
				// Handle the error and send an error response to the client
				responseMsg := models.Data{
					Type:    "deleteRoomError",
					Message: "Delete Room Error",
					Empty:   queryError, // Send the error message to the client
				}
				responseJSON, err := json.Marshal(responseMsg)
				if err != nil {
					log.Println("JSON Marshal error:", err)
					continue
				}

				if err := conn.WriteMessage(messageType, responseJSON); err != nil {
					log.Println(err)
				}
			} else {
				removeAllIdInRoom(msg.RoomID)
			}
		default:
			// Handle unknown message types or log them as needed
			log.Printf("Received unknown message type: %s\n", msg.Type)
		}

		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println("endReaderError", err)
		}
	}
}

func sendToRoom(roomID int, messageType int, message []byte, currentClient *websocket.Conn) {
	clients, ok := roomClients[roomID]
	if !ok {
		log.Println("No clients in room")
		return
	}
	for _, client := range clients {
		if client.Conn != currentClient {
			if err := client.Conn.WriteMessage(messageType, message); err != nil {
				log.Println(err)
			}
		}
	}
}

func getRoomIDForClient(conn *websocket.Conn) int {
	for _, clientRooms := range roomClients {
		for _, clientRoom := range clientRooms {
			if clientRoom.Conn == conn {
				return clientRoom.ID
			}
		}
	}
	return 0
}

func setRoomIDForClient(conn *websocket.Conn, roomID int) {
	currentRoomID := getRoomIDForClient(conn)
	if currentRoomID != 0 && currentRoomID != roomID && roomID != 0 {
		clients := roomClients[currentRoomID]
		for i, clientRoom := range clients {
			if clientRoom.Conn == conn {
				// Remove the client from the room
				roomClients[currentRoomID] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
	}

	// Add the connection to the new room
	roomClients[roomID] = append(roomClients[roomID], &ClientRoom{Conn: conn, ID: roomID})
}

func removeRoomIDForClient(conn *websocket.Conn) {
	currentRoomID := getRoomIDForClient(conn)
	if currentRoomID != 0 {
		clients := roomClients[currentRoomID]
		for i, clientRoom := range clients {
			if clientRoom.Conn == conn {
				// Remove the client from the room
				roomClients[currentRoomID] = append(clients[:i], clients[i+1:]...)
				break
			}
		}
	}
}

func removeAllIdInRoom(roomID int) {
	clients := roomClients[roomID]
	for i, clientRoom := range clients {
		if clientRoom.ID == roomID {
			// Remove the client from the room
			roomClients[roomID] = append(clients[:i], clients[i+1:]...)
			break
		}
	}
}