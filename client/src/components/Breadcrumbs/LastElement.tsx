import { SoftTypography } from "..";

export type LastElementProps = {
  light: boolean;
  title: string;
};

const LastElement = ({ light, title }: LastElementProps): JSX.Element => (
  <SoftTypography
    variant="button"
    fontWeight="regular"
    textTransform="capitalize"
    color={light ? "white" : "dark"}
    textOverflow="ellipsis"
    fontSize="medium"
    maxWidth="100px"
    overflow="hidden"
    whiteSpace="nowrap"
    sx={{
      textOverflow: "ellipsis",
    }}
  >
    {title}
  </SoftTypography>
);

export default LastElement;
