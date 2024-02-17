import "./translations";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  Alert,
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { Chip } from "@mui/material";
import CopyrightIcon from "@mui/icons-material/Copyright";
import ReactPlayer from "react-player";
import { Exercise } from "../../api/quadcoachApi/domain";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
} from "../exerciseApi";
import { useTranslation } from "react-i18next";

import logo from "../../../public/logo.svg";

const Home = () => {
  const { t } = useTranslation("Home");

  return (
    <div>
      <SoftBox
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: "250px", margin: "50px 0" }}
        />
      </SoftBox>
      <SoftBox>
        <Card sx={{ height: "100%" }}>
          <SoftBox p={2}>
            <SoftBox display="flex" justifyContent="space-between" width="100%">
              <SoftTypography
                variant="h3"
                fontWeight="bold"
                textTransform="uppercase"
              >
                Beta Tesing
              </SoftTypography>
              <SoftTypography
                variant="h3"
                fontWeight="bold"
                textTransform="uppercase"
              >
                05.Feb.2024
              </SoftTypography>
            </SoftBox>
            <SoftTypography>
              As Login is implemented we can do the fist Beta Testing of the App
              Quadcoach
            </SoftTypography>
          </SoftBox>
        </Card>
      </SoftBox>
      <SoftBox mt={5} mb={3}>
        <Card sx={{ height: "100%" }}>
          <SoftBox p={2}>
            <SoftBox display="flex" justifyContent="space-between" width="100%">
              <SoftTypography
                variant="h3"
                fontWeight="bold"
                textTransform="uppercase"
              >
                Alpha Testing
              </SoftTypography>
              <SoftTypography
                variant="h3"
                fontWeight="bold"
                textTransform="uppercase"
              >
                04.Feb.2024
              </SoftTypography>
            </SoftBox>
            <SoftTypography>
              Local Alpha Testing works well and we are constantly adding new
              features
            </SoftTypography>
          </SoftBox>
        </Card>
      </SoftBox>
    </div>
  );
};

export default Home;
