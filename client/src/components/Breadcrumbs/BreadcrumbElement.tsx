import { Link, Skeleton } from "@mui/material";
import TitleElement from "./TitleElement";
import LastElement from "./LastElement";

export type BreadcrumbElementProps = {
  title: string;
  path?: string;
  isLastElement: boolean;
  isLoading: boolean;
  light: boolean;
};

const BreadcrumbElement = ({
  title,
  path,
  isLastElement,
  isLoading,
  light,
}: BreadcrumbElementProps): JSX.Element => {
  if (isLoading) {
    return (
      <Skeleton
        variant="text"
        width={100}
        height={24}
        sx={(theme) => ({
          color: light ? theme.palette.white.main : theme.palette.black.main,
        })}
      />
    );
  }

  if (isLastElement) {
    return <LastElement light={light} title={title} />;
  }

  if (!path) {
    return <TitleElement title={title} light={light} />;
  }

  return (
    <Link
      href={path}
      fontWeight="regular"
      textTransform="capitalize"
      fontSize="medium"
      maxWidth="100px"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      sx={(theme) => ({
        color: light ? theme.palette.white.main : theme.palette.black.main,
      })}
    >
      {title}
    </Link>
  );
};

export default BreadcrumbElement;
