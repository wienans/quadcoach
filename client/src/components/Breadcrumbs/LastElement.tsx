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
  >
    {title}
  </SoftTypography>
);

export default LastElement;
