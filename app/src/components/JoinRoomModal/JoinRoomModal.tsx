import { useState } from "react";
import { Button, Form, Image, InputGroup, Modal, Stack } from "react-bootstrap";
import { JoinRoomModalProps } from "../../models/props";
import * as WebSocket from "websocket";
import { ApiUrls } from "../../utils/apiUrls";
import { imagesArray } from "../../pages/Homepage/Homepage";

export default function JoinRoomModal({
  show,
  handleClose,
}: JoinRoomModalProps) {
  const [validated, setValidated] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>();
  const [playerAvatar, setPlayerAvatar] = useState<number>(0);

  const socket = new WebSocket.w3cwebsocket(ApiUrls.ws);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setValidated(true);

    if (form.checkValidity()) {
      socket.send(
        JSON.stringify({
          type: "joinRoom",
          roomName: roomName,
          playerAvatar: playerAvatar + 1,
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
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Rejoindre une partie</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          id="room-join-form"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <Stack
            style={{ flexDirection: "row", justifyContent: "center" }}
            gap={1}
          >
            {imagesArray.map((image, index) => (
              <div
                onClick={() => setPlayerAvatar(index)}
                aria-label="Player avatar"
                style={{ alignItems: "center", marginBottom: "16px" }}
                key={index}
              >
                <Image
                  key={index}
                  style={{
                    width: 50,
                    height: "auto",
                    border: index === playerAvatar ? "3px solid blue" : "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  src={image}
                  alt={"avatar" + index}
                />
              </div>
            ))}
          </Stack>
          <Form.Group controlId="validationRoomName">
            <InputGroup hasValidation>
              <InputGroup.Text id="inputGroupPrepend">#</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Renseignez le nom de la partie ici"
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Pas de partie trouvée
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="room-join-form"
          variant="primary"
          disabled={!roomName || roomName === ""}
        >
          Rejoindre
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
