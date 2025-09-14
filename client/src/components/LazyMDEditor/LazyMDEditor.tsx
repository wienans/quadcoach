import { lazy, Suspense, ComponentProps } from "react";
import { CircularProgress, Box } from "@mui/material";

// Lazy load the MDEditor to prevent it from being included in the main bundle
const MDEditor = lazy(() => import("@uiw/react-md-editor"));

// Import styles only when the component is used
import("@uiw/react-md-editor/markdown-editor.css");
import("@uiw/react-markdown-preview/markdown.css");

type MDEditorProps = ComponentProps<typeof MDEditor>;

const LazyMDEditor = (props: MDEditorProps) => {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      }
    >
      <MDEditor {...props} />
    </Suspense>
  );
};

export default LazyMDEditor;