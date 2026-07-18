import crypto from "crypto";
import {
  createMongoShareLinkPersistenceAdapters,
  ProductionShareLinkResourceTypes,
} from "./mongoShareLinkAdapters";
import { shareLinkManagementAuthority } from "./resourceAuthorizationAuthority";
import {
  createShareLinks,
  ShareLinkManagementAuthority,
  ShareLinks,
} from "./shareLinks";

export interface ProductionShareLinksOptions {
  publicBaseUrl?: string;
  tokens?: { next(): string };
  maxTokenAttempts?: number;
  authority?: ShareLinkManagementAuthority;
}

export function createProductionShareLinks(
  options: ProductionShareLinksOptions = {},
): ShareLinks<ProductionShareLinkResourceTypes> {
  return createShareLinks<ProductionShareLinkResourceTypes>({
    authority: options.authority ?? shareLinkManagementAuthority,
    persistence: createMongoShareLinkPersistenceAdapters(),
    tokens: options.tokens ?? { next: () => crypto.randomUUID() },
    publicBaseUrl:
      options.publicBaseUrl ??
      process.env.PUBLIC_BASE_URL ??
      "https://quadcoach.app",
    maxTokenAttempts: options.maxTokenAttempts,
  });
}
