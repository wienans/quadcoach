import { Card, CardContent, CardHeader, Skeleton } from "@mui/material";

const ExerciseLoadingCard = (): JSX.Element => {
  return (
    <Card>
      <CardHeader
        avatar={<Skeleton variant="circular" />}
        title={<Skeleton variant="text" />}
      />
      <CardContent>
        <Skeleton variant="rectangular" width="100%" height="300px" />
      </CardContent>
    </Card>
  );
};

export default ExerciseLoadingCard;
