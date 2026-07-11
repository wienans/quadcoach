import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const DYNAMIC_IMPORT_ERROR_PATTERNS = [
  "failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "importing a module script failed",
  "failed to load module script",
  "chunkloaderror",
  "loading chunk",
];

const RETRY_KEY_PREFIX = "quadcoach:route-import-retry:";
const RETRY_TTL_MS = 10_000;

const getErrorMessage = (error: unknown): string => {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText} ${String(error.data ?? "")}`;
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
};

const isDynamicImportError = (message: string): boolean => {
  const normalizedMessage = message.toLowerCase();
  return DYNAMIC_IMPORT_ERROR_PATTERNS.some((pattern) =>
    normalizedMessage.includes(pattern),
  );
};

const getRetryKey = (): string =>
  `${RETRY_KEY_PREFIX}${window.location.pathname}${window.location.search}${window.location.hash}`;

const getLastRetryAt = (retryKey: string): number => {
  const rawRetryAt = window.sessionStorage.getItem(retryKey);
  return rawRetryAt ? Number(rawRetryAt) : 0;
};

const RouteErrorBoundary = (): JSX.Element => {
  const error = useRouteError();
  const [isReloading, setIsReloading] = useState(false);
  const errorMessage = getErrorMessage(error);
  const shouldAutoReload = isDynamicImportError(errorMessage);

  useEffect(() => {
    if (!shouldAutoReload) return;

    try {
      const retryKey = getRetryKey();
      const lastRetryAt = getLastRetryAt(retryKey);

      if (Date.now() - lastRetryAt < RETRY_TTL_MS) return;

      window.sessionStorage.setItem(retryKey, String(Date.now()));
      setIsReloading(true);
      window.location.reload();
    } catch {
      setIsReloading(true);
      window.location.reload();
    }
  }, [shouldAutoReload]);

  if (isReloading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 3,
          textAlign: "center",
        }}
      >
        <CircularProgress />
        <Typography variant="h6">Refreshing the page...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Alert severity="error" sx={{ width: "100%", maxWidth: 640 }}>
        <Typography variant="h6" gutterBottom>
          {shouldAutoReload ? "Could not load this page" : "Something went wrong"}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {shouldAutoReload
            ? "The app tried to refresh once, but this page still could not be loaded."
            : "The app hit an unexpected route error."}
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
        {import.meta.env.DEV && (
          <Typography
            variant="body2"
            component="pre"
            sx={{ mt: 2, whiteSpace: "pre-wrap", overflow: "auto" }}
          >
            {errorMessage}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default RouteErrorBoundary;
