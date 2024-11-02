import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  children: string;
}

const MarkdownRenderer = ({ children }: MarkdownRendererProps) => {
  return <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>;
};

export default MarkdownRenderer;
