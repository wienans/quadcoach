import { RouteHandleType } from "./routeTypes";

const routes = [
  {
    path: "/",
    handle: {
      type: RouteHandleType.layout,
    },
    async lazy() {
      const Layout = (await import("../../components/Layout")).default;
      return {
        element: <Layout />,
      };
    },
    children: [
      {
        index: true,
        handle: {
          type: RouteHandleType.dashboard,
        },
        async lazy() {
          const Home = (await import("../Home")).default;
          return {
            element: <Home />,
          };
        },
      },
      // For future, we might have a dashboard on home instead of list of only exercise
      {
        path: "/exercises",
        handle: {
          type: RouteHandleType.exercises,
        },
        async lazy() {
          const ExerciseListRoot = (await import("../Exercises"))
            .ExerciseListRoot;
          return {
            element: <ExerciseListRoot />,
          };
        },
        children: [
          {
            path: ":id",
            handle: {
              type: RouteHandleType.exercise,
            },
            async lazy() {
              const ExerciseRoot = (await import("../Exercises")).ExerciseRoot;
              return {
                element: <ExerciseRoot />,
              };
            },
          },
        ],
      },
      {
        path: "/tacticboards",
        handle: {
          type: RouteHandleType.tacticBoards,
        },
        async lazy() {
          const TacticBoardListRoot = (await import("../TacticBoardList"))
            .default;
          return {
            element: <TacticBoardListRoot />,
          };
        },
        children: [
          {
            path: ":id",
            handle: {
              type: RouteHandleType.tacticBoardProfile,
            },
            async lazy() {
              const TacticsBoardProfileRoot = (
                await import("../TacticBoardProfile")
              ).default;
              return {
                element: <TacticsBoardProfileRoot />,
              };
            },
          },
          {
            path: ":id/update",
            handle: {
              type: RouteHandleType.tacticBoard,
            },
            async lazy() {
              const TacticsBoardWrapper = (await import("../TacticBoard"))
                .default;
              return {
                element: <TacticsBoardWrapper />,
              };
            },
          },
        ],
      },
      {
        path: "/drafting-board",
        handle: {
          type: RouteHandleType.draftingBoard,
        },
        async lazy() {
          const DraftingBoard = (await import("../DraftingBoard")).default;
          return {
            element: <DraftingBoard />,
          };
        },
      },
      {
        path: "/users",
        // handle: {
        //   type: RouteHandleType.userProfile,
        // },
        // async lazy() {
        //   // const Home = (await import("../Home")).default;
        //   // return {
        //   //   element: <Home />,
        //   // };
        // },
        children: [
          {
            path: ":id",
            handle: {
              type: RouteHandleType.userProfile,
            },
            async lazy() {
              const UserProfileRoot = (await import("../UserProfile")).default;
              return {
                element: <UserProfileRoot />,
              };
            },
          },
        ],
      },
      {
        path: "/login",
        handle: {
          type: RouteHandleType.dashboard,
        },
        async lazy() {
          const Login = (await import("../Login")).default;
          return {
            element: <Login />,
          };
        },
      },
      {
        path: "/register",
        handle: {
          type: RouteHandleType.dashboard,
        },
        async lazy() {
          const Register = (await import("../Register")).default;
          return {
            element: <Register />,
          };
        },
      },
      {
        path: "/verifyEmail",
        handle: {
          type: RouteHandleType.dashboard,
        },
        async lazy() {
          const VerifyEmail = (await import("../VerifyEmail")).default;
          return {
            element: <VerifyEmail />,
          };
        },
      },
      {
        path: "/resetPassword",
        handle: {
          type: RouteHandleType.dashboard,
        },
        async lazy() {
          const ResetPassword = (await import("../ResetPassword")).default;
          return {
            element: <ResetPassword />,
          };
        },
      },
      {
        path: "/updatePassword",
        handle: {
          type: RouteHandleType.dashboard,
        },
        async lazy() {
          const UpdatePassword = (await import("../UpdatePassword")).default;
          return {
            element: <UpdatePassword />,
          };
        },
      },
    ],
  },
];

export default routes;
