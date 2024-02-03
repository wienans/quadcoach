import { Link, Skeleton } from "@mui/material";
import TitleElement from "./TitleElement";
import LastElement from "./LastElement";

export type BreadcrumbElementProps = {
  title: string;
  path?: string;
  isLastElement: boolean;
  isLoading: boolean;
};

const BreadcrumbElement = ({
  title,
  path,
  isLastElement,
  isLoading,
}: BreadcrumbElementProps): JSX.Element => {
  if (isLoading) {
    return <Skeleton variant="text" width={100} height={24} />;
  }

  if (isLastElement) {
    return <LastElement light={false} title={title} />;
  }

  if (!path) {
    return <TitleElement title={title} light={false} />;
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
    >
      {title}
    </Link>
  );
};

export default BreadcrumbElement;
