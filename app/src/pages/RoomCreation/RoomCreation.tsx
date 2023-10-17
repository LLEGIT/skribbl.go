import { useState } from "react";
import { Button, Container, Form, Image, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ApiUrls } from "../../utils/apiUrls";
import * as WebSocket from "websocket";
import { imagesArray } from "../Homepage/Homepage";

export default function RoomCreation() {
  const playersNumberOptions: Array<number> = [2, 3, 4, 5, 6, 7, 8];
  const drawTimeOptions: Array<number> = [30, 60, 90, 120];
  const roundsNumberOptions: Array<number> = [1, 2, 3, 4, 5];
  const [playersNumber, setPlayersNumber] = useState<number>(2);
  const [playerAvatar, setPlayerAvatar] = useState<number>(0);
  const [drawTime, setDrawTime] = useState<number>(30);
  const [roundsNumber, setRoundsNumber] = useState<number>(1);

  const socket = new WebSocket.w3cwebsocket(ApiUrls.ws);

  const data = {
    playersNumber: playersNumber,
    drawTime: drawTime,
    roundsNumber: roundsNumber,
    username: localStorage.getItem("username"),
    playerAvatar: playerAvatar + 1,
  };
  const createRoomFromWebSocket = () => {
    socket.send(JSON.stringify({ type: "roomCreation", room: data }));
    socket.onmessage = (msg: any) => {
      let tmp = JSON.parse(msg.data);
      if (tmp.Type === "createdRoom") {
        window.location.replace(`/room/${tmp.Room.ID}`);
      }
    };
  };

  return (
    <Container
      style={{
        display: "flex",
        alignItems: "center",
        height: "99vh",
      }}
    >
      <Link to="/">
        <Button style={{ position: "absolute", top: 25, left: 25 }}>
          Retour
        </Button>
      </Link>
      <Form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 25,
          width: "100%",
          alignItems: "center",
        }}
      >
        <Stack
          style={{ flexDirection: "row", justifyContent: "center" }}
          gap={3}
        >
          {imagesArray.map((image, index) => (
            <div
              onClick={() => setPlayerAvatar(index)}
              aria-label="Player avatar"
              style={{ alignItems: "center" }}
              key={index}
            >
              <Image
                key={index}
                style={{
                  width: 50,
                  height: "auto",
                  border: index === playerAvatar ? "3px solid white" : "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                src={image}
                alt={"avatar" + index}
              />
            </div>
          ))}
        </Stack>
        <Form.Group
          style={{
            display: "flex",
            gap: 50,
            alignItems: "center",
          }}
        >
          <Form.Label style={{ color: "white", minWidth: "fit-content" }}>
            Nombre de joueurs
          </Form.Label>
          <Form.Select
            onChange={(event) => setPlayersNumber(parseInt(event.target.value))}
            aria-label="Players number select"
          >
            {playersNumberOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group
          style={{
            display: "flex",
            gap: 50,
            alignItems: "center",
          }}
        >
          <Form.Label style={{ color: "white", minWidth: "fit-content" }}>
            Temps pour dessiner (secondes)
          </Form.Label>
          <Form.Select
            onChange={(event) => setDrawTime(parseInt(event.target.value))}
          >
            {drawTimeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group
          style={{
            display: "flex",
            gap: 50,
            alignItems: "center",
          }}
        >
          <Form.Label style={{ color: "white", minWidth: "fit-content" }}>
            Nombre de rounds
          </Form.Label>
          <Form.Select
            onChange={(event) => setRoundsNumber(parseInt(event.target.value))}
          >
            {roundsNumberOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button variant="primary" onClick={createRoomFromWebSocket}>
          Valider
        </Button>
      </Form>
    </Container>
  );
}
