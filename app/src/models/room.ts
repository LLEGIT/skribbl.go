import { Player } from "./player";
export interface Room {
  ID: number;
  Name: string;
  CurrentPlayers: Player[];
  playerAvatar: number;
  playersNumber: number;
  drawTime: number;
  roundsNumber: number;
  isPrivate: boolean;
  createdAt: EpochTimeStamp;
  CurrentRound: number;
  username: string;
}
