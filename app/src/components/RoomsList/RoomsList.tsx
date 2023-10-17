import { useEffect, useState } from "react";
import { Badge, Container, ListGroup, Row, Spinner } from "react-bootstrap";
import { Room } from "../../models/room";
import { ApiUrls } from "../../utils/apiUrls";
import * as WebSocket from "websocket";

export default function RoomsList() {
  const [rooms, setRooms] = useState<Array<Room>>();
  const [fetchRooms, setFetchRooms] = useState<boolean>();
  const socket = new WebSocket.w3cwebsocket(ApiUrls.ws);

  useEffect(() => {
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "getAllRooms" }));
      socket.onmessage = (msg: any) => {
        let parsedJson = JSON.parse(msg.data);
        setRooms(parsedJson?.Rooms ?? []);

        socket.close();
      };
    };

    // Fetch regurlarly
    setTimeout(() => {
      setFetchRooms(!fetchRooms);
    }, 10000);
  }, [fetchRooms]);

  const handleJoinRoom = (roomName: string) => {
    socket.send(
      JSON.stringify({
        type: "joinRoom",
        roomName: roomName,
        playerAvatar: Math.floor(Math.random() * (8 - 1)) + 1,
        nickname: localStorage.getItem("username"),
      })
    );
    socket.onmessage = (msg: any) => {
      let tmp = JSON.parse(msg.data);
      if (tmp.Type === "joinedRoom") {
        window.location.replace(`/room/${tmp.RoomID}`);
      }
      if (tmp.Type === "joinedRoomError") {
        alert("You are already part of a room");
      }
    };
  }

  return (
    <Container
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
    >
      <Row xs={12} style={{ marginBottom: 10 }}>
        <h3 style={{ textAlign: "center", color: "white" }}>
          Liste des parties publiques
        </h3>
      </Row>

      <ListGroup defaultActiveKey="#link1" style={{ width: "50%" }}>
        {rooms ? (
          rooms.length > 0 ? (
            rooms.map((room, index) => (
              <ListGroup.Item
                key={index}
                action
                onClick={() => handleJoinRoom(room.Name)}
                className="d-flex justify-content-between align-items-start"
              >
                #{room.Name}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge bg="danger">
                    {room.CurrentPlayers?.length}/{room.playersNumber} joueurs
                  </Badge>
                  <Badge bg="dark">
                    il y a{" "}
                    {/* Gets hours difference between created at and now */}
                    {Math.round(
                      (new Date().getTime() -
                        new Date(room.createdAt).getTime()) /
                        3600000
                    )}{" "}
                    heure
                    {Math.round(
                      (new Date().getTime() -
                        new Date(room.createdAt).getTime()) /
                        3600000
                    ) > 1 && "s"}
                  </Badge>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <Container
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Badge bg="danger" style={{ fontSize: 20 }}>
                Aucune partie publique en cours
              </Badge>
            </Container>
          )
        ) : (
          // Loading
          <Container
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spinner variant="light" style={{ width: 30, height: 30 }} />
          </Container>
        )}
      </ListGroup>
    </Container>
  );
}
