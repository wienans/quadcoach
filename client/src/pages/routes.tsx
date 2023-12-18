const routes = [
  {
    path: "/",
    async lazy() {
      const Layout = (await import("../components/Layout")).default;
      return {
        element: <Layout />,
      };
    },
    children: [
      {
        index: true,
        async lazy() {
          const ExerciseList = (await import("./ExerciseList")).default;
          return {
            element: <ExerciseList />,
          };
        },
      },
      // For future, we might have a dashboard on home instead of list of only exercise
      {
        path: "/exercises",
        async lazy() {
          const ExerciseList = (await import("./ExerciseList")).default;
          return {
            element: <ExerciseList />,
          };
        },
      },
      {
        path: "/exercises/add",
        async lazy() {
          const AddExercise = (await import("./AddExercise")).default;
          return {
            element: <AddExercise />,
          };
        },
      },
      {
        path: "/exercises/:id",
        async lazy() {
          const Exercise = (await import("./Exercise")).default;
          return {
            element: <Exercise />,
          };
        },
      },
      {
        path: "/exercises/:id/update",
        async lazy() {
          const UpdateExercise = (await import("./UpdateExercise")).default;
          return {
            element: <UpdateExercise />,
          };
        },
      },
      {
        path: "/tacticboards/:id/update",
        async lazy() {
          const UpdateTacticBoard = (await import("./UpdateTacticBoard"))
            .default;
          return {
            element: <UpdateTacticBoard />,
          };
        },
      },
      {
        path: "/tacticsboard",
        async lazy() {
          const TacticsBoard = (await import("./TacticsBoard")).default;
          return {
            element: <TacticsBoard />,
          };
        },
      },
      {
        path: "/componentsTest",
        async lazy() {
          const ComponentsTest = (await import("./ComponentsTest")).default;
          return {
            element: <ComponentsTest />,
          };
        },
      },
    ],
  },
];

export default routes;
