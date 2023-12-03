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
    sx={{ lineHeight: 0 }}
  >
    {title}
  </SoftTypography>
);

export default LastElement;
