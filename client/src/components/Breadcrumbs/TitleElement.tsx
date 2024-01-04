import { SoftTypography } from "..";

type TitleElementProps = {
  title: string;
  light: boolean;
};

const TitleElement = ({ title, light }: TitleElementProps) => (
  <SoftTypography
    key={title}
    component="span"
    variant="button"
    fontWeight="regular"
    textTransform="capitalize"
    color={light ? "white" : "dark"}
    opacity={light ? 0.8 : 0.5}
    sx={{ lineHeight: 0 }}
  >
    {title}
  </SoftTypography>
);

export default TitleElement;
