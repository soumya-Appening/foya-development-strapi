/**
 * project controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::project.project",
  ({ strapi }) => ({
    async find(ctx) {
      const { query } = ctx;

      // Support custom `limit` param => maps to Strapi v4 pagination[pageSize]
      const { limit, ...restQuery } = query as Record<string, any>;

      const pageSize = limit ? Number(limit) : undefined;
      if (pageSize !== undefined && (Number.isNaN(pageSize) || pageSize <= 0)) {
        ctx.throw(400, "Invalid limit parameter");
      }

      // Build Strapi-compliant query
      const normalizedQuery: Record<string, any> = { ...restQuery };

      // Merge boolean flag filters if present (treat "1"/"true" as true)
      const booleanFlags = [
        "isPastProject",
        "isNewConstruction",
        "isRehabilitation",
        "isAffordable",
        "isMarketRate",
        "isCommercial",
        "isMixedUse",
        "isMultiFamilyResidential"
      ];
      const toBooleanTrue = (val: unknown): boolean => {
        if (typeof val === "boolean") return val === true;
        if (typeof val === "number") return val === 1;
        if (typeof val === "string")
          return ["1", "true"].includes(val.toLowerCase());
        return false;
      };
      const existingFilters = (normalizedQuery.filters ?? {}) as Record<
        string,
        any
      >;
      const mergedFilters: Record<string, any> = { ...existingFilters };
      for (const flag of booleanFlags) {
        if (flag in restQuery && toBooleanTrue((restQuery as any)[flag])) {
          mergedFilters[flag] = { $eq: true };
        }
      }
      if (Object.keys(mergedFilters).length > 0) {
        normalizedQuery.filters = mergedFilters;
      }
      if (pageSize !== undefined) {
        normalizedQuery.pagination = {
          page: 1,
          pageSize,
          ...((restQuery as any).pagination || {})
        };
      }

      const entity = await strapi
        .service("api::project.project")
        .find(normalizedQuery);
      return this.transformResponse(entity);
    }
  })
);
