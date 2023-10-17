import { Button, Container, Image, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import notFoundImage from "./../../assets/404_image.png";

export default function NotFound() {
  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "99vh",
        gap: 15
      }}
    >
        <Image src={notFoundImage} style={{ width: 150, height: 150 }} />
        <h4 style={{ color: "white" }}>Cette page n'existe pas</h4>
        <Link to="/">
            <Button color="danger">Accueil</Button>
        </Link>
    </Container>
  );
}
