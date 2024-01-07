import { SoftTypography } from "..";

type TitleElementProps = {
  title: string;
  light: boolean;
};

const TitleElement = ({ title, light }: TitleElementProps) => (
  <SoftTypography
    component="span"
    variant="button"
    fontWeight="regular"
    textTransform="capitalize"
    color={light ? "white" : "dark"}
    opacity={light ? 0.8 : 0.5}
    fontSize="medium"
  >
    {title}
  </SoftTypography>
);

export default TitleElement;
