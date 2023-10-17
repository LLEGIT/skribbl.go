import { useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";

interface PlayerCreationModalProps {
  show: boolean;
  setShowPlayerCreation: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PlayerCreationModal({
  show,
  setShowPlayerCreation,
}: PlayerCreationModalProps) {
  const [playerName, setPlayerName] = useState<string>();

  const handleSubmit = () => {
    if (!playerName) return;
    localStorage.setItem("username", playerName);
    setShowPlayerCreation(false);
  };

  return (
    <Modal show={show}>
      <Modal.Header>
        <Modal.Title>Bienvenue !</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="player-join-form" noValidate>
          <Form.Group controlId="validationPlayerName">
            <InputGroup hasValidation>
              <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Renseignez votre pseudo"
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Veuillez remplir le champ
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={handleSubmit}
          form="player-join-form"
          variant={playerName ? "primary" : "secondary"}
          disabled={playerName ? false : true}
        >
          Continuer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
