import {
  Badge,
  Container,
  Toast,
  Spinner,
  Image,
  ListGroup,
} from "react-bootstrap";
import { Canvas } from "../../components/Canvas/Canvas";
import { useEffect, useState } from "react";
import { Room as RoomModel } from "../../models/room";
import * as WebSocket from "websocket";
import { ApiUrls } from "../../utils/apiUrls";
import {
  NavigateFunction,
  useNavigate,
  useParams,
} from "react-router-dom";
import logo from "./../../assets/logo.gif";
import Chatroom from "../../components/Chatroom";
import parseJson from "../../utils/parseJson";
import WordsModal from "../../components/WordsModal";
import { socketOnMessageHandler } from "../../utils/socketOnMessageHandler";
import { Player } from "../../models/player";

export default function Room() {
  const [room, setRoom] = useState<RoomModel>();
  const [canvasSrc, setCanvasSrc] = useState<string>();
  const [socket, setSocket] = useState<WebSocket.w3cwebsocket>();
  const navigate: NavigateFunction = useNavigate();
  const { id } = useParams();
  const [showToast, setShowToast] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [word, setWord] = useState<string>();
  const [originalWord, setOriginalWord] = useState<string>("");
  const [solved, setSolved] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<string>>([]);
  const [guessWord, setGuessWord] = useState<string>("");
  const [cluesGiven, setCluesGiven] = useState(0);
  const [guessInterval, setGuessInterval] = useState<NodeJS.Timeout>();
  const [players, setPlayers] = useState<Array<Player>>();
  const [playerTurnDrawing, setPlayerTurnDrawing] = useState<boolean>();
  const [drawTime, setDrawTime] = useState<number>();

  useEffect(() => {
    const webSocket = new WebSocket.w3cwebsocket(ApiUrls.ws);
    setSocket(webSocket);
  }, []);

  useEffect(() => {
    if (socket) {
      if (id) {
        socket.onopen = () => {
          socket.send(
            JSON.stringify({ type: "getRoom", roomId: parseInt(id) })
          );
          socket.onmessage = (msg: any) => {
            const stringifiedData: string = msg?.data;

            // Prevents double call
            if (stringifiedData.includes('"Room":')) {
              parseJson(msg.data).then((result) => {
                if (result?.Room?.ID === 0) {
                  navigate("/not-found");
                }

                setRoom(result?.Room);
                setPlayers(result?.Room?.CurrentPlayers);
                setDrawTime(result?.Room?.drawTime);
                setCanvasSrc(result?.Room?.Src)
              }).catch(() => {
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
  }, [room, id, navigate, socket]);

  const copyToClipboard = () => {
    room?.Name &&
      navigator.clipboard
        .writeText(room?.Name)
        .then(() => {
          setShowToast(true);
        })
        .catch((error: any) => {
          console.error("Error copying text: ", error);
        });
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleGetWords = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "getWords" }));
      socket.onmessage = (msg: any) => {
        const parsedJson = JSON.parse(msg.data);
        if (parsedJson.Type === "ThreeWords" && parsedJson.Words.length > 0) {
          setWords(parsedJson.Words);
        }
      };
    }
  };

  const handleSetWord = (word: string) => {
    setWords([]);
    setWord(word);
    if (socket && id) {
      socket.send(
        JSON.stringify({ type: "setWord", roomId: parseInt(id), word })
      );
    }
  };

  if (socket) {
    socket.onmessage = (msg: any) => {
      socketOnMessageHandler({
        msg,
        setMessages,
        messages,
        setOriginalWord,
        guessWord,
        setGuessWord,
        setGuessInterval,
        cluesGiven,
        setCluesGiven,
        setCanvasSrc,
        playerTurnDrawing,
        setRoom,
        setPlayers,
        setDrawTime,
      });
    };
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    if (players) {
      determinePlayerDrawing();
    }
  }, [players]);

  const determinePlayerDrawing = () => {
    players?.forEach((player) => {
      if (
        player.Username === localStorage.getItem("username") &&
        player.IsDrawing
      ) {
        setPlayerTurnDrawing(true);
        return;
      }
    });
  };

  const handleLeavingRoom = (redirect?: boolean) => {
    if (socket && id) {
      socket.send(
        JSON.stringify({
          type: "leaveRoom",
          roomId: parseInt(id),
          Nickname: localStorage.getItem("username"),
        })
      );
      socket.close();
      if (redirect) {
        navigate("/");
      }
    }
  };

  window.addEventListener("beforeunload", (ev) => {
    ev.preventDefault();
    handleLeavingRoom();
  });

  useEffect(() => {
    if (guessWord) {
      const timer = setTimeout(() => {
        if ((drawTime ?? 1) > 0) {
          setDrawTime((prevDrawTime) => (prevDrawTime ?? 0) - 1);
        } else {
          if (room?.CurrentRound === room?.roundsNumber) {
            alert("Game over");
            socket?.send(
              JSON.stringify({ type: "deleteRoom", roomId: parseInt(id!) })
            );
            navigate("/");
          } else if (playerTurnDrawing) {
            socket?.send(
              JSON.stringify({ type: "startNewRound", roomId: parseInt(id!) })
            );
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [guessWord, drawTime]);

  return (
    <>
      <WordsModal
        words={words}
        isOpen={words && words.length > 0}
        toggle={handleSetWord}
      />
      {(room && (
        <div style={{ display: "flex" }}>
          <div style={{ marginLeft: "20px", marginTop: "100px" }}>
            <ListGroup>
              {players && players.map((player) => (
                <ListGroup.Item key={player.ID} style={{display: "flex", alignItems: "center"}}>
                  <Image
                    style={{ width: 30, height: 30, marginRight: 10 }}
                    src={require(`./../../assets/poney_${player.AvatarID}.png`)}
                  />
                  {player.Username}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          <Container
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "99vh",
              gap: 10,
            }}
          >
            <div style={{ padding: "24px 0" }}>
              <Image
                style={{
                  width: 200,
                  height: "auto",
                  position: "absolute",
                  left: 20,
                  top: 10,
                  cursor: "pointer",
                }}
                src={logo}
                onClick={() => handleLeavingRoom(true)}
              />
            </div>
            <div onClick={handleGetWords}>
              {playerTurnDrawing && <Badge bg="success" style={{ fontSize: 20 }}>
                Get words
              </Badge>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
              <Badge bg="danger" style={{ fontSize: 20 }}>
                {room.CurrentPlayers?.length}/{room?.playersNumber} connecté
                {room.CurrentPlayers?.length > 1 && "s"}
              </Badge>
              <div
                onClick={copyToClipboard}
                style={{
                  cursor: "pointer",
                }}
              >
                <Badge bg="dark" style={{ fontSize: 20 }}>
                  #{room?.Name}
                </Badge>
                <Toast
                  show={showToast}
                  onClose={handleCloseToast}
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    width: "270px",
                  }}
                >
                  <Toast.Body>
                    #{room.Name} copié dans le presse-papier
                  </Toast.Body>
                </Toast>
              </div>
              <Badge bg="warning" style={{ fontSize: 20 }}>
                Round {room?.CurrentRound}/{room?.roundsNumber}
              </Badge>
              {guessWord && <Badge bg={drawTime === 0 ? "danger" : "secondary"} style={{ fontSize: 20 }}>
                  ⌛ {drawTime} seconds
                </Badge>}
            </div>

            {socket && id && (
              <Container
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  marginLeft: 50,
                  gap: 110,
                }}
              >
                <Canvas
                  socket={socket}
                  settedWord={word}
                  originalWord={originalWord}
                  setGuessWord={setGuessWord}
                  cluesGiven={cluesGiven}
                  solved={solved}
                  guessWord={guessWord}
                  guessInterval={guessInterval}
                  src={canvasSrc ?? ""}
                  playerTurnDrawing={playerTurnDrawing ?? false}
                />
                <Chatroom
                  socket={socket}
                  originalWord={originalWord}
                  setSolved={setSolved}
                  RoomID={id}
                  setMessages={setMessages}
                  messages={messages}
                  playerTurnDrawing={playerTurnDrawing ?? false}
                />
              </Container>
            )}
          </Container>
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
    </>
  );
}
