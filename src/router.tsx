import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "./lib/pages/HomePage";
import { InfoPage } from "./lib/pages/InfoPage";
import { KnotsPage } from "./lib/pages/KnotsPage";
import { KnotPage } from "./lib/pages/KnotPage";
import { ProfilePage } from "./lib/pages/ProfilePage";
import { EditProfilePage } from "./lib/pages/EditProfilePage";
import { PostPage } from "./lib/pages/PostPage";
import { UserPage } from "./lib/pages/UserPage";
import { MobileScreen } from "./lib/layouts/MobileScreen/MobileScreen";

export const router = createBrowserRouter([
  {
    element: <MobileScreen />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <HomePage /> },
      { path: "knots", element: <KnotsPage /> },
      { path: "knot/:knotId", element: <KnotPage /> },
      { path: "info", element: <InfoPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/edit", element: <EditProfilePage /> },
      { path: "post/:postId", element: <PostPage /> },
      { path: "user/:username", element: <UserPage /> },
      {
        path: "signin/*",
        lazy: () =>
          import("./lib/pages/SignInPage").then((m) => ({
            Component: m.SignInPage,
          })),
      },
      { path: "*", element: <Navigate to="/home" replace /> },
    ],
  },
]);
