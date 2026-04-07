import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/markdown.css";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  children: string;
}

const MarkdownRenderer = ({ children }: MarkdownRendererProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        overflowX: "auto",
        "& .wmde-markdown": {
          backgroundColor: "transparent",
          color: "inherit",
          fontFamily: "inherit",
        },
        "& .wmde-markdown > :first-of-type": {
          mt: 0,
        },
        "& .wmde-markdown > :last-child": {
          mb: 0,
        },
        "& .wmde-markdown pre": {
          overflowX: "auto",
        },
        "& .wmde-markdown table": {
          display: "block",
          maxWidth: "100%",
          overflowX: "auto",
        },
      }}
    >
      <MDEditor.Markdown
        source={children}
        remarkPlugins={[remarkGfm]}
        wrapperElement={{ "data-color-mode": theme.palette.mode }}
      />
    </Box>
  );
};

export default MarkdownRenderer;
