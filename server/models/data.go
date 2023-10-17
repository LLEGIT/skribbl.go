package models

type Room struct {
	ID            int
	Name          string
	PlayerAvatar  int     `json:"playerAvatar"`
	PlayersNumber int     `json:"playersNumber"`
	DrawTime      int     `json:"drawTime"`
	RoundsNumber  int     `json:"roundsNumber"`
	Username      string  `json:"username"`
	CurrentWord   *string `json:"currentWord"`

	IsPrivate      bool   `json:"isPrivate"`
	CreatedAt      string `json:"createdAt"`
	CurrentRound   int
	CurrentPlayers []Player
	Src            *string
}

type Player struct {
	ID        int
	Username  string
	RoomID    int
	AvatarID  int
	IsAdmin   bool
	CreatedAt string
	Score     int
	FoundWord bool
	IsDrawing bool
}

type Data struct {
	Type         string
	Nickname     string
	Message      string
	Data         string
	RoomID       int
	Room         Room
	RoomName     string
	Rooms        []Room
	Empty        error
	Player       Player
	Players      []Player
	PlayerAvatar int
	Words        []string
	Word         string
}

type Drawing struct {
	id     int
	src    string
	roomId int
}
