export interface Player {
  ID: number;
  Username: string;
  roomID: number;
  AvatarID: number;
  CreatedAt: Date;
  isAdmin: boolean;
  Score: number;
  FoundWord: boolean;
  IsDrawing: boolean;
}
