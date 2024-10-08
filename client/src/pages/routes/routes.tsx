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
            path: "add",
            handle: {
              type: RouteHandleType.addExercise,
            },
            async lazy() {
              const AddExercise = (await import("../Exercises")).AddExercise;
              return {
                element: <AddExercise />,
              };
            },
          },
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
            children: [
              {
                path: "update",
                handle: {
                  type: RouteHandleType.updateExercise,
                },
                async lazy() {
                  const UpdateExercise = (await import("../Exercises"))
                    .UpdateExercise;
                  return {
                    element: <UpdateExercise />,
                  };
                },
              },
            ],
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
        path: "/componentsTest",
        handle: {
          type: RouteHandleType.componentsTest,
        },
        async lazy() {
          const ComponentsTest = (await import("../ComponentsTest")).default;
          return {
            element: <ComponentsTest />,
          };
        },
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
    ],
  },
];

export default routes;
