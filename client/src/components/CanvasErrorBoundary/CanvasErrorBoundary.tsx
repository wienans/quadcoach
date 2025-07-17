import React, { Component, ReactNode } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SoftBox from "../SoftBox";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error("Canvas Error Boundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SoftBox
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            p: 3,
            textAlign: "center",
          }}
        >
          <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Canvas Error
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Something went wrong with the tactic board canvas. This might be
              due to:
            </Typography>
            <Box component="ul" sx={{ textAlign: "left", pl: 2 }}>
              <li>Invalid tactic board data</li>
              <li>Browser compatibility issues</li>
              <li>Memory constraints</li>
              <li>Network connectivity problems</li>
            </Box>
          </Alert>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.handleRetry}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                width: "100%",
                maxWidth: 800,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Error Details (Development Only):
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontSize: "0.75rem", overflow: "auto" }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </Typography>
            </Box>
          )}
        </SoftBox>
      );
    }

    return this.props.children;
  }
}
