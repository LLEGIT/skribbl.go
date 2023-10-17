import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useMousePosition } from "../../utils/useMousePosition";
import { Toolbar, ToolbarProps } from "../Toolbar";
import * as WebSocket from "websocket";
import "./style.scss";
import parseJson from "../../utils/parseJson";

interface CanvasProps {
  socket: WebSocket.w3cwebsocket;
  settedWord?: string;
  originalWord?: string;
  setGuessWord: (guessWord: string) => void;
  cluesGiven: number;
  guessWord?: string;
  solved?: boolean;
  guessInterval?: NodeJS.Timeout;
  src: string;
  playerTurnDrawing: boolean;
}

export const Canvas = ({
  socket,
  settedWord,
  originalWord,
  setGuessWord,
  cluesGiven,
  guessWord,
  solved,
  guessInterval,
  src,
  playerTurnDrawing,
}: CanvasProps) => {
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coords, handleCoords] = useMousePosition();
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [toolbarProps, setToolbarProps] = useState<ToolbarProps>({
    stroke: "#000000",
    lineWidth: 3,
  });
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>();

  useEffect(() => {
    if (canvasRef?.current) {
      draw(canvasContext as CanvasRenderingContext2D);
      setCanvasContext(canvasRef.current?.getContext("2d"));
    }

    if (canvasContext) {
      switch (src) {
        case undefined:
          break;
        case null:
          break;
        case "clear":
          canvasContext?.clearRect(0, 0, 800, 600);
          break;
        default:
          let drawingFromDb = new Image();

          drawingFromDb.onload = function () {
            canvasContext?.drawImage(drawingFromDb, 0, 0);
          };

          drawingFromDb.src = src;
          break;
      }
    }
  }, [coords.x, coords.y, isDrawing, src, canvasContext]);

  useEffect(() => {
    if (
      originalWord &&
      originalWord.length / 2 < cluesGiven &&
      cluesGiven !== 0
    ) {
      return () => clearInterval(guessInterval);
    }
  }, [cluesGiven]);

  useEffect(() => {
    if (solved && originalWord) {
      clearInterval(guessInterval as NodeJS.Timeout);
      setGuessWord(originalWord);
    }
  }, [solved]);

  useEffect(() => {
    if (settedWord) {
      setGuessWord(settedWord);
    }
  }, [settedWord]);

  const onElementChange = (event: ChangeEvent<HTMLInputElement>) => {
    setToolbarProps({
      ...toolbarProps,
      [event.target.name]: event.target.value,
    });
  };

  const clearCanvas = () => {
    canvasContext?.clearRect(0, 0, 800, 600);
    setIsDrawing(false);

    requestAnimationFrame(() => {
      sendToSocket("clear");
    });
  };

  const sendToSocket = (clear: string | null = null) => {
    if (socket?.readyState === WebSocket.w3cwebsocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "canvas",
          data: clear ?? canvasRef?.current?.toDataURL("image/png"),
        })
      );
    }
  };

  const draw = (canvasContext: CanvasRenderingContext2D) => {
    if (!isDrawing) {
      return;
    }

    canvasContext.lineWidth = toolbarProps.lineWidth;
    canvasContext.strokeStyle = toolbarProps.stroke;
    canvasContext.lineCap = "round";
    canvasContext.lineTo(coords.x, coords.y);
    canvasContext.stroke();

    // Add a timestamp to track the last update
    const currentTime = Date.now();

    // If there's no last update or the time since the last update is greater than 125ms
    if (!lastUpdateTime || currentTime - lastUpdateTime > 125) {
      sendToSocket(); // Send the update
      setLastUpdateTime(currentTime); // Update the last update time
    }
  };

  return (
    <div
      className="canvas-root"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "600px",
      }}
    >
      <div className="canvas-guessing-word">{guessWord}</div>
      {guessWord && <canvas
        id="canvas"
        ref={canvasRef}
        width="800"
        height="600"
        onMouseMove={(e) => {
          if (playerTurnDrawing) {
            handleCoords(e as unknown as MouseEvent);
          }
        }}
        onMouseDown={(e) => {
          if (playerTurnDrawing) {
            setIsDrawing(true);
          }
        }}
        onMouseUp={() => {
          if (playerTurnDrawing) {
            setIsDrawing(false);
            canvasContext?.stroke();
            canvasContext?.beginPath();
          }
        }}
        style={{
          border: "2px solid black",
          backgroundColor: "white",
          cursor: "crosshair",
          margin: 0,
        }}
      ></canvas> || <div className="canvas-placeholder">
        <h4>Please choose a word to start...</h4>
      </div>}
      {playerTurnDrawing && (
        <Toolbar
          stroke={toolbarProps.stroke}
          lineWidth={toolbarProps.lineWidth}
          onElementChange={onElementChange}
          clearCanvas={clearCanvas}
        />
      )}
    </div>
  );
};
