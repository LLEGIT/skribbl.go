import { Route, Routes } from "react-router-dom";
import React from "react";
import RoomCreation from "./pages/RoomCreation/RoomCreation";
import Homepage from "./pages/Homepage/Homepage";
import Room from "./pages/Room/Room";
import NotFound from "./pages/NotFound/NotFound";
import GameOver from "./pages/GameOver/GameOver";

export default function Router() {
  const routes: Array<{ path: string; element: React.ReactNode }> = [
    { path: "/", element: <Homepage /> },
    { path: "/new", element: <RoomCreation /> },
    { path: "/room/:id", element: <Room /> },
    { path: "/game-over/:id", element: <GameOver />},
    { path: "*", element: <NotFound /> }
  ];

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}
