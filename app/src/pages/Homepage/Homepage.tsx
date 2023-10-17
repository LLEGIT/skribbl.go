import { useEffect } from "react";
import { Button, Container, Stack, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import * as WebSocket from "websocket";
import logo from "./../../assets/logo.gif";
import poney1 from "./../../assets/poney_1.png";
import poney2 from "./../../assets/poney_2.png";
import poney3 from "./../../assets/poney_3.png";
import poney4 from "./../../assets/poney_4.png";
import poney5 from "./../../assets/poney_5.png";
import poney6 from "./../../assets/poney_6.png";
import poney7 from "./../../assets/poney_7.png";
import poney8 from "./../../assets/poney_8.png";
import { ApiUrls } from "../../utils/apiUrls";
import { useState } from "react";
import JoinRoomModal from "../../components/JoinRoomModal/JoinRoomModal";
import RoomsList from "../../components/RoomsList/RoomsList";
import PlayerCreationModal from "../../components/Player/PlayerCreationModal";
import { Room as RoomModel } from "../../models/room";

export const imagesArray: Array<string> = [
  poney1,
  poney2,
  poney3,
  poney4,
  poney5,
  poney6,
  poney7,
  poney8,
];

export default function Homepage() {
  const links: Array<{ path: string; label: string }> = [
    { path: "/new", label: "Créer une room" },
    { path: "#", label: "Rejoindre une partie" },
  ];
  const [show, setShow] = useState<boolean>(false);
  const [showPlayerCreation, setShowPlayerCreation] = useState<boolean>(false);
  const [currentPlayerRoom, setCurrentPlayerRoom] = useState<RoomModel>();

  const handleClose: () => void = () => setShow(false);

  const handleShow: () => void = () => {
    isUserAlreadyInRoom();
    currentPlayerRoom?.ID === 0 && setShow(true);
  };

  // Add this useEffect to listen for changes in currentPlayerRoom
  useEffect(() => {
    // Check if currentPlayerRoom has a value and redirect
    if (currentPlayerRoom?.ID !== 0 && currentPlayerRoom?.Name !== undefined) {
      alert(`Déjà dans la partie #${currentPlayerRoom?.Name}`);
    }
  }, [currentPlayerRoom]);

  // Player creation modal handling
  useEffect(() => {
    if (!localStorage.getItem("username")) {
      setShowPlayerCreation(true);
    }
  }, []);

  const changeUsername = () => {
    localStorage.removeItem("username");
    setShowPlayerCreation(true);
  };

  const socket: any = new WebSocket.w3cwebsocket(ApiUrls.ws);

  const isUserAlreadyInRoom = () => {
    if (socket.readyState === WebSocket.w3cwebsocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "checkPlayerRoom",
          nickname: localStorage.getItem("username"),
        })
      );
      socket.onmessage = (msg: any) => {
        try {
          const parsedData = JSON.parse(msg.data);
          parsedData.Room !== undefined &&
            setCurrentPlayerRoom(parsedData.Room);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
    }
  };

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 30,
        alignItems: "center",
        marginTop: 25,
      }}
    >
      <Stack style={{ alignItems: "center" }} gap={3}>
        <Image style={{ width: 469, height: "auto" }} src={logo} />
      </Stack>
      {/* Actions */}
      {links.map((link, index) => (
        <Link key={index} to={link.path}>
          <Button onClick={handleShow}>{link.label}</Button>
        </Link>
      ))}

      <JoinRoomModal show={show} handleClose={handleClose} />

      <RoomsList />
      <PlayerCreationModal
        show={showPlayerCreation}
        setShowPlayerCreation={setShowPlayerCreation}
      />

      <Button onClick={changeUsername}>Changer de pseudo</Button>
    </Container>
  );
}
