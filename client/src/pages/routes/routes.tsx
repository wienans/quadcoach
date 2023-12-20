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
          const ExerciseListRoot = (await import("../ExerciseList")).default;
          return {
            element: <ExerciseListRoot />,
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
          const ExerciseListRoot = (await import("../ExerciseList")).default;
          return {
            element: <ExerciseListRoot />,
          };
        },
        children: [
          // {
          //   index: true,
          //   handle: {
          //     type: RouteHandleType.exercises,
          //   },
          //   async lazy() {
          //     const ExerciseList = (await import("../ExerciseList")).default;
          //     return {
          //       element: <ExerciseList />,
          //     };
          //   },
          // },
          {
            path: "add",
            handle: {
              type: RouteHandleType.addExercise,
            },
            async lazy() {
              const AddExercise = (await import("../AddExercise")).default;
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
              const Exercise = (await import("../Exercise")).default;
              return {
                element: <Exercise />,
              };
            },
          },
          {
            path: ":id/update",
            handle: {
              type: RouteHandleType.updateExercise,
            },
            async lazy() {
              const UpdateExercise = (await import("../UpdateExercise"))
                .default;
              return {
                element: <UpdateExercise />,
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
              type: RouteHandleType.tacticBoard,
            },
            async lazy() {
              return {
                element: <div></div>,
              };
            },
          },
          {
            path: ":id/update",
            handle: {
              type: RouteHandleType.updateTacticBoard,
            },
            async lazy() {
              const UpdateTacticBoardMeta = (
                await import("../UpdateTacticBoardMeta")
              ).default;
              return {
                element: <UpdateTacticBoardMeta />,
              };
            },
          },
          {
            path: ":id/updateBoard",
            handle: {
              type: RouteHandleType.updateTacticBoard,
            },
            async lazy() {
              const UpdateTacticBoard = (await import("../UpdateTacticBoard"))
                .default;
              const FabricJsContextProvider = (await import("../../components"))
                .FabricJsContextProvider;
              return {
                element: (
                  <FabricJsContextProvider>
                    <UpdateTacticBoard />
                  </FabricJsContextProvider>
                ),
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
    ],
  },
];

export default routes;
