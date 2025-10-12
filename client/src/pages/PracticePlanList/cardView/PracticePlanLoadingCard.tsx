import { Card, CardContent, CardHeader, Skeleton } from "@mui/material";

const PracticePlanLoadingCard = (): JSX.Element => {
  return (
    <Card>
      <CardHeader
        avatar={<Skeleton variant="circular" />}
        title={<Skeleton variant="text" />}
        subheader={<Skeleton variant="text" width="60%" />}
      />
      <CardContent sx={{ height: "194px", position: "relative" }}>
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  );
};

export default PracticePlanLoadingCard;