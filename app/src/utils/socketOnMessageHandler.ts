import React from "react";
import parseJson from "./parseJson";
import { Room } from "../models/room";

interface socketOnMessageHandlerProps {
  msg: any;
  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
  messages: string[];
  setOriginalWord: React.Dispatch<React.SetStateAction<string>>;
  guessWord: string;
  setGuessWord: React.Dispatch<React.SetStateAction<string>>;
  setGuessInterval: React.Dispatch<
    React.SetStateAction<NodeJS.Timeout | undefined>
  >;
  cluesGiven: number;
  setCluesGiven: React.Dispatch<React.SetStateAction<number>>;
  setCanvasSrc: React.Dispatch<React.SetStateAction<string | undefined>>;
  playerTurnDrawing: boolean | undefined;
  setRoom: React.Dispatch<React.SetStateAction<Room | undefined>>;
  setPlayers: React.Dispatch<React.SetStateAction<undefined | any>>;
  setDrawTime: React.Dispatch<React.SetStateAction<undefined | number>>;
}

export const socketOnMessageHandler = ({
  msg,
  setMessages,
  messages,
  setOriginalWord,
  setGuessWord,
  setGuessInterval,
  setCluesGiven,
  setCanvasSrc,
  playerTurnDrawing,
  setRoom,
  setPlayers,
  setDrawTime,
}: socketOnMessageHandlerProps) => {
  parseJson(msg.data).then((data) => {
    if (
      (data.type === "text" || data.Type === "text") &&
      messages &&
      setMessages
    ) {
      setMessages([...messages, `${data.Nickname} : ${data.message}`]);
    }
    
    if (data.Type === "canvas" || data.type === "canvas") {
      setCanvasSrc(data?.data);
    }
  
    if (
      (data.Type === "setWordSuccess" || data.type === "setWordSuccess") &&
      setOriginalWord &&
      setGuessWord &&
      setGuessInterval &&
      setCluesGiven
    ) {
      setOriginalWord(data.Word);
      setGuessWord(playerTurnDrawing ? data.Word : data.Word.replace(/./g, "_"));
      setGuessInterval(
        setInterval(() => {
          setCluesGiven((cluesGiven) => cluesGiven + 1);
          const randomLetter = Math.floor(Math.random() * data.Word.length);
          setGuessWord(
            (guessWord) =>
              guessWord.substring(0, randomLetter) +
              data.Word.charAt(randomLetter) +
              guessWord.substring(randomLetter + 1)
          );
        }, 5000)
      );
    }
  
    if (
      data.Type === "userFoundWordSuccess" ||
      data.type === "userFoundWordSuccess"
    ) {
      setMessages([...messages, `${data.Nickname} a trouvé le mot !`]);
    }

    if (
      data.Type === "leaveRoomSuccess" ||
      data.type === "leaveRoomSuccess"
    ) {
      setMessages([...messages, `${data.Nickname} a quitté la room !`]);
    }

    if (
      data.Type === "playerJoined" ||
      data.type === "playerJoined"
    ) {
      setMessages([...messages, `${data.Nickname} a rejoint la room !`]);
    }

    if (
      data.Type === "newRound" ||
      data.type === "newRound"
    ) {
      setRoom(data?.Room);
      setPlayers(data?.Room?.CurrentPlayers);
      setDrawTime(data?.Room?.drawTime);
    }
  })
};
