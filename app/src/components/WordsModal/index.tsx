import { Badge } from "react-bootstrap";
import "./style.scss";

interface WordsModalProps {
  words: string[];
  isOpen: boolean;
  toggle: (word: string) => void;
}

export default function WordsModal(props: WordsModalProps) {
  return (
    <>
      {props.isOpen && (
        <div className="words-modal-root">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            className="words-modal-content"
          >
            <h1 style={{ paddingTop: "10px" }}>Choisissez votre mot</h1>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                margin: "20px 0",
              }}
            >
              {props.words.map((word) => (
                <Badge
                  bg="dark"
                  style={{ fontSize: 20 }}
                  key={word}
                  className="words-modal-word"
                  onClick={() => props.toggle(word)}
                >
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
