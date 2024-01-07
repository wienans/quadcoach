import { UIMatch, useMatches } from "react-router-dom";
import { SoftBox, SoftButton } from "../../..";
import {
  RouteHandle,
  RouteHandleType,
} from "../../../../pages/routes/routeTypes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type QuickNavigationButtonProps = {
  titleResourceKey: string;
  href?: string;
};

const useGetQuickNavigations = () => {
  const routeMatches = useMatches() as UIMatch<unknown, RouteHandle>[];
  const [quickNavigationButtons, setQuickNavigationButtons] = useState<
    QuickNavigationButtonProps[]
  >([]);

  useEffect(() => {
    const routeMatchesWithHandleType = routeMatches.filter(
      (route) => route.handle?.type != null,
    );

    const routeMatchesWithHandleTypeLength = routeMatchesWithHandleType.length;
    if (!routeMatchesWithHandleTypeLength) {
      setQuickNavigationButtons([]);
      return;
    }

    const lastRoute =
      routeMatchesWithHandleType[routeMatchesWithHandleTypeLength - 1];
      
    const quickNavigationButtons: QuickNavigationButtonProps[] = [];

    if (
      [
        RouteHandleType.addExercise,
        RouteHandleType.exercise,
        RouteHandleType.updateExercise,
        RouteHandleType.dashboard,
      ].includes(lastRoute.handle.type)
    ) {
      quickNavigationButtons.push({
        titleResourceKey: "DashboardNavbar:quickNavigation.exercises",
        href: "/exercises",
      });
    }

    setQuickNavigationButtons(quickNavigationButtons);
  }, [routeMatches]);

  return quickNavigationButtons;
};

const QuickNavigation = (): JSX.Element => {
  const { t } = useTranslation();
  const quickNavigations = useGetQuickNavigations();
  return (
    <>
      <SoftBox
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },
        }}
      >
        {quickNavigations.map((quickNavigation) => (
          <SoftButton
            key={quickNavigation.titleResourceKey}
            href={quickNavigation.href}
          >
            {t(quickNavigation.titleResourceKey)}
          </SoftButton>
        ))}
      </SoftBox>
    </>
  );
};

export default QuickNavigation;
