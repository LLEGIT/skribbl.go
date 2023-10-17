import { Container, Spinner } from "react-bootstrap";
import cupImage from "./../../assets/cup.png";
import { useNavigate, useParams } from "react-router-dom";
import "./style.scss";
import { useEffect, useState } from "react";
import { Room } from "../../models/room";
import { ApiUrls } from "../../utils/apiUrls";
import * as WebSocket from "websocket";
import parseJson from "../../utils/parseJson";

export default function GameOver() {
  const { id } = useParams();
  const [socket, setSocket] = useState<WebSocket.w3cwebsocket>();
  const [room, setRoom] = useState<Room>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      const webSocket = new WebSocket.w3cwebsocket(ApiUrls.ws);
      setSocket(webSocket);
    }
  }, [socket]);

  useEffect(() => {
    if (!room && socket) {
      if (id) {
        socket.onopen = () => {
          console.log("coucou")
          socket.send(
            JSON.stringify({ type: "getRoom", roomId: parseInt(id) })
          );
          socket.onmessage = (msg: any) => {
            const stringifiedData: string = msg?.data;

            // Prevents double call
            if (stringifiedData.includes('"Room":')) {
              parseJson(msg.data)
                .then((result) => {
                  if (result?.Room?.ID === 0) {
                    navigate("/not-found");
                  }

                  setRoom(result?.Room);
                })
                .catch(() => {
                  // Redirect to 404 page
                  navigate("/not-found");
                });
            }
          };
        };
      } else {
        // Redirect to 404 page
        navigate("/not-found");
      }
    }
  }, [room]);

  console.log(room)

  return (
    <Container className="main-container">
      {(room && (
        <div className="dashboard">
          <div className="image-text-holder">
            <img src={cupImage} />
            <h4>Results</h4>
          </div>
        </div>
      )) || (
        // Loading
        <Container
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "99vh",
          }}
        >
          <Spinner variant="light" style={{ width: 80, height: 80 }} />
        </Container>
      )}
    </Container>
  );
}
