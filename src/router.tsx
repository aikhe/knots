import { createBrowserRouter, Navigate } from "react-router";
import { HomePage } from "./lib/pages/HomePage";
import { InfoPage } from "./lib/pages/InfoPage";
import { KnotsPage } from "./lib/pages/KnotsPage";
import { KnotPage } from "./lib/pages/KnotPage";
import { EditKnotPage } from "./lib/pages/EditKnotPage";
import { ErrorPage } from "./lib/pages/ErrorPage";
import { JoinPage } from "./lib/pages/JoinPage";
import { ProfilePage } from "./lib/pages/ProfilePage";
import { FriendsPage } from "./lib/pages/FriendsPage";
import { EditProfilePage } from "./lib/pages/EditProfilePage";
import { PostPage } from "./lib/pages/PostPage";
import { EditPostPage } from "./lib/pages/EditPostPage";
import { UserPage } from "./lib/pages/UserPage";
import { MobileScreen } from "./lib/layouts/MobileScreen/MobileScreen";

export const router = createBrowserRouter([
  {
    element: <MobileScreen />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <HomePage /> },
      { path: "knots", element: <KnotsPage /> },
      { path: "knot/:knotId", element: <KnotPage /> },
      { path: "knot/:knotId/edit", element: <EditKnotPage /> },
      { path: "join/:token", element: <JoinPage /> },
      { path: "info", element: <InfoPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/friends", element: <FriendsPage /> },
      { path: "profile/edit", element: <EditProfilePage /> },
      { path: "post/:postId", element: <PostPage /> },
      { path: "post/:postId/edit", element: <EditPostPage /> },
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
