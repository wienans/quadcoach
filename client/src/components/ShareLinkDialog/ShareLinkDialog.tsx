import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { forwardRef, useEffect, useRef, useState } from "react";

import type { ShareLinkStatusResponse } from "../../api/quadcoachApi/shareLink";
import { SoftButton, SoftInput } from "../index";

interface ShareLinkOperation {
  (resourceId: string): { unwrap(): Promise<unknown> };
}

interface ShareLinkDialogLabels {
  title: string;
  error: string;
  inactive: string;
  copy: string;
  close: string;
  create: string;
  rotate: string;
  revoke: string;
}

interface ShareLinkDialogProps {
  open: boolean;
  resourceId: string;
  status?: ShareLinkStatusResponse;
  isStatusPending: boolean;
  isStatusError: boolean;
  isEnsurePending: boolean;
  isRotatePending: boolean;
  isRevokePending: boolean;
  ensure: ShareLinkOperation;
  rotate: ShareLinkOperation;
  revoke: ShareLinkOperation;
  labels: ShareLinkDialogLabels;
  onClose(): void;
}

const ShareLinkDialog = forwardRef<HTMLDivElement, ShareLinkDialogProps>(
  (
    {
      open,
      resourceId,
      status,
      isStatusPending,
      isStatusError,
      isEnsurePending,
      isRotatePending,
      isRevokePending,
      ensure,
      rotate,
      revoke,
      labels,
      onClose,
    },
    ref,
  ) => {
    const [hasOperationError, setHasOperationError] = useState(false);
    const [isCopyHighlightActive, setIsCopyHighlightActive] = useState(false);
    const copyHighlightTimeoutRef = useRef<ReturnType<
      typeof setTimeout
    > | null>(null);
    const shareLink = status?.status === "active" ? status.shareLink : "";

    useEffect(
      () => () => {
        if (copyHighlightTimeoutRef.current) {
          clearTimeout(copyHighlightTimeoutRef.current);
        }
      },
      [],
    );

    const run = async (operation: ShareLinkOperation) => {
      if (!resourceId) return;
      setHasOperationError(false);
      try {
        await operation(resourceId).unwrap();
      } catch {
        setHasOperationError(true);
      }
    };

    const copy = async () => {
      if (!shareLink) return;
      try {
        await navigator.clipboard.writeText(shareLink);
        setIsCopyHighlightActive(true);
        if (copyHighlightTimeoutRef.current) {
          clearTimeout(copyHighlightTimeoutRef.current);
        }
        copyHighlightTimeoutRef.current = setTimeout(
          () => setIsCopyHighlightActive(false),
          1000,
        );
      } catch {
        setHasOperationError(true);
      }
    };

    const close = () => {
      setHasOperationError(false);
      setIsCopyHighlightActive(false);
      onClose();
    };

    return (
      <Dialog ref={ref} open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{labels.title}</DialogTitle>
        <DialogContent>
          {(isStatusError || hasOperationError) && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {labels.error}
            </Alert>
          )}
          {isStatusPending ? (
            <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
          ) : status?.status === "active" ? (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <SoftInput
                readOnly
                fullWidth
                value={shareLink}
                sx={{ flex: 1, minWidth: 0 }}
              />
              <Tooltip title={labels.copy}>
                <span>
                  <IconButton
                    onClick={copy}
                    disabled={!shareLink}
                    color={isCopyHighlightActive ? "info" : "inherit"}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              {labels.inactive}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <SoftButton onClick={close}>{labels.close}</SoftButton>
          {status?.status === "active" ? (
            <>
              <SoftButton
                onClick={() => run(rotate)}
                disabled={isStatusPending || isRotatePending}
              >
                {labels.rotate}
              </SoftButton>
              <SoftButton
                color="error"
                onClick={() => run(revoke)}
                disabled={isStatusPending || isRevokePending}
              >
                {labels.revoke}
              </SoftButton>
            </>
          ) : (
            <SoftButton
              onClick={() => run(ensure)}
              disabled={isStatusPending || isEnsurePending}
            >
              {labels.create}
            </SoftButton>
          )}
        </DialogActions>
      </Dialog>
    );
  },
);

export default ShareLinkDialog;
