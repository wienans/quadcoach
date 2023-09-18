const routes = [
    {
        path: "/",
        async lazy () {
            const Layout = (await import("../components/Layout")).default;
            return {
                element: <Layout />,
            };
        },
        children: [
            {
                index: true,
                async lazy () {
                    const ExerciseList = (await import("./ExerciseList")).default;
                    return {
                        element: <ExerciseList />,
                    };
                },
            },
            {
                path: "/exercise/add",
                async lazy () {
                    const AddExercise = (await import("./AddExercise")).default;
                    return {
                        element: <AddExercise />,
                    };
                },
            },
            {
                path: "/exercise/:id",
                async lazy () {
                    const Exercise = (await import("./Exercise")).default;
                    return {
                        element: <Exercise />,
                    };
                },
            },
            {
                path: "/exercise/:id/update",
                async lazy () {
                    const UpdateExercise = (await import("./UpdateExercise")).default;
                    return {
                        element: <UpdateExercise />,
                    };
                },
            }
        ],
    }
]

export default routes
