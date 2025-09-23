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
      const {
        limit,
        page,
        sort,
        isFeatured,
        // category filters
        category,
        categoryId,
        categorySlug,
        categoryName,
        // status filters
        status,
        statusId,
        statusSlug,
        statusName,
        // specific project by id
        id,
        // related projects
        relatedTo,
        ...restQuery
      } = query as Record<string, any>;

      // Default pagination: limit=10, page=1
      const pageSize = limit ? Number(limit) : 10;
      const currentPage = page ? Number(page) : 1;

      if (Number.isNaN(pageSize) || pageSize <= 0) {
        ctx.throw(400, "Invalid limit parameter");
      }
      if (Number.isNaN(currentPage) || currentPage <= 0) {
        ctx.throw(400, "Invalid page parameter");
      }

      // Build Strapi-compliant query
      // Allow only valid top-level keys for entityService
      const normalizedQuery: Record<string, any> = {};

      if (restQuery.filters) normalizedQuery.filters = restQuery.filters;
      if (restQuery.sort) normalizedQuery.sort = restQuery.sort;
      if (restQuery.pagination)
        normalizedQuery.pagination = restQuery.pagination;
      if (restQuery.populate) normalizedQuery.populate = restQuery.populate;
      if (restQuery.fields) normalizedQuery.fields = restQuery.fields;

      // Helper to coerce values to a strict true boolean
      const toBooleanTrue = (val: unknown): boolean => {
        if (typeof val === "boolean") return val === true;
        if (typeof val === "number") return val === 1;
        if (typeof val === "string")
          return ["1", "true"].includes(val.toLowerCase());
        return false;
      };
      const toStringArray = (val: unknown): string[] => {
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === "string")
          return val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        if (val == null) return [];
        return [String(val)];
      };
      const existingFilters = (normalizedQuery.filters ?? {}) as Record<
        string,
        any
      >;
      const mergedFilters: Record<string, any> = { ...existingFilters };

      // Explicit isFeatured flag support
      if (isFeatured !== undefined && toBooleanTrue(isFeatured)) {
        mergedFilters.isFeatured = { $eq: true };
      }

      // Category/status boolean flags mapped to known slug/name aliases
      const flagToAliases: Record<
        string,
        { slugs: string[]; names: string[] }
      > = {
        isPastProject: {
          slugs: ["past-projects", "past-project"],
          names: ["Past Projects", "Past Project"]
        },
        isNewConstruction: {
          slugs: ["new-constructions", "new-construction"],
          names: ["New Constructions", "New Construction"]
        },
        isRehabilitation: {
          slugs: ["rehabilitation"],
          names: ["Rehabilitation"]
        },
        isAffordable: {
          slugs: ["affordable"],
          names: ["Affordable"]
        },
        isMarketRate: {
          slugs: ["market-rate"],
          names: ["Market-Rate", "Market Rate"]
        },
        isCommercial: {
          slugs: ["commercial"],
          names: ["Commercial"]
        },
        isMixedUse: {
          slugs: ["mixed-use"],
          names: ["Mixed-Use", "Mixed Use"]
        },
        isMultiFamilyResidential: {
          slugs: ["multifamily-residential", "multi-family-residential"],
          names: ["Multifamily Residential", "Multi Family Residential"]
        },
        isCurrentProject: {
          slugs: ["current-project", "current-projects"],
          names: ["Current Project", "Current Projects"]
        }
      };
      for (const [flag, aliases] of Object.entries(flagToAliases)) {
        if (flag in restQuery && toBooleanTrue((restQuery as any)[flag])) {
          const orConditions = [
            ...aliases.slugs.map((s) => ({
              project_categories: { slug: { $eqi: s } }
            })),
            ...aliases.names.map((n) => ({
              project_categories: { name: { $eqi: n } }
            }))
          ];
          mergedFilters.$and = [
            ...(mergedFilters.$and || []),
            { $or: orConditions }
          ];
        }
      }

      // If explicit id is provided, return that project only
      if (id !== undefined && id !== null && String(id).length > 0) {
        const projectId = Array.isArray(id) ? id[0] : id;
        const entity = await strapi.entityService.findOne(
          "api::project.project",
          projectId as any,
          {
            populate: normalizedQuery.populate ?? {
              coverImage: true,
              gallery: true,
              project_categories: true
            }
          }
        );
        return this.transformResponse(entity);
      }

      // Related projects: same category as a given project id, excluding it
      if (relatedTo) {
        const baseId = Array.isArray(relatedTo) ? relatedTo[0] : relatedTo;
        const relatedEntity = await strapi.entityService.findOne(
          "api::project.project",
          baseId as any,
          {
            populate: { project_categories: true }
          }
        );
        const relatedCategoryId = (relatedEntity as any)
          ?.project_categories?.[0]?.id;
        if (relatedCategoryId) {
          mergedFilters.$and = [
            ...(mergedFilters.$and || []),
            { project_categories: { id: { $eq: relatedCategoryId } } },
            { id: { $ne: baseId } }
          ];
        } else {
          // If there's no category on the source, return empty set
          mergedFilters.id = { $in: [] };
        }
      }

      // Resolve category/status by string with optional type constraint
      const resolveCategoryString = async (
        value: string,
        typeConstraint?: "category" | "status"
      ): Promise<string | number | undefined> => {
        const filters: Record<string, any> = {
          $or: [{ slug: { $eqi: value } }, { name: { $eqi: value } }]
        };
        if (typeConstraint) filters.type = { $eq: typeConstraint };
        const found = await strapi.entityService.findMany(
          "api::project-category.project-category",
          {
            filters,
            limit: 1,
            fields: ["id"]
          }
        );
        if (found?.length) return found[0].id as any;
        return undefined;
      };

      // Category filters: by id, slug, or name. Accept multiple values.
      const collectIdsFromParam = async (
        param: any,
        typeConstraint?: "category" | "status"
      ): Promise<Array<string | number>> => {
        const results: Array<string | number> = [];
        if (param === undefined || param === null) return results;
        const candidates: any[] = Array.isArray(param)
          ? param
          : toStringArray(param);
        for (const candidate of candidates) {
          if (
            typeof candidate === "number" ||
            (typeof candidate === "string" && /^\d+$/.test(candidate))
          ) {
            results.push(
              typeof candidate === "number" ? candidate : Number(candidate)
            );
          } else if (typeof candidate === "string") {
            const id = await resolveCategoryString(candidate, typeConstraint);
            if (id !== undefined) results.push(id);
          } else if (candidate && typeof candidate === "object") {
            if (
              "id" in candidate &&
              (typeof (candidate as any).id === "string" ||
                typeof (candidate as any).id === "number")
            ) {
              results.push((candidate as any).id as any);
            } else if (
              "slug" in candidate &&
              typeof (candidate as any).slug === "string"
            ) {
              const id = await resolveCategoryString(
                (candidate as any).slug,
                typeConstraint
              );
              if (id !== undefined) results.push(id);
            } else if (
              "name" in candidate &&
              typeof (candidate as any).name === "string"
            ) {
              const id = await resolveCategoryString(
                (candidate as any).name,
                typeConstraint
              );
              if (id !== undefined) results.push(id);
            }
          }
        }
        return results;
      };

      // Categories (type=category)
      const categoryParam =
        category ?? categoryId ?? categorySlug ?? categoryName;
      if (categoryParam !== undefined && relatedTo === undefined) {
        const categoryIds = await collectIdsFromParam(
          categoryParam,
          "category"
        );
        if (categoryIds.length > 0) {
          mergedFilters.project_categories = { id: { $in: categoryIds } };
        } else {
          mergedFilters.id = { $in: [] };
        }
      }

      // Status (type=status)
      const statusParam = status ?? statusId ?? statusSlug ?? statusName;
      if (statusParam !== undefined) {
        const statusIds = await collectIdsFromParam(statusParam, "status");
        if (statusIds.length > 0) {
          mergedFilters.$and = [
            ...(mergedFilters.$and || []),
            { project_categories: { id: { $in: statusIds } } }
          ];
        } else {
          mergedFilters.id = { $in: [] };
        }
      }
      if (Object.keys(mergedFilters).length > 0) {
        normalizedQuery.filters = mergedFilters;
      }

      // Set pagination with defaults
      normalizedQuery.pagination = {
        page: currentPage,
        pageSize,
        ...((restQuery as any).pagination || {})
      };

      // Default sort: sortOrder ascending, allow sort=asc|desc to control
      const direction =
        typeof sort === "string" && ["asc", "desc"].includes(sort.toLowerCase())
          ? sort.toLowerCase()
          : "asc";
      if (!normalizedQuery.sort) {
        normalizedQuery.sort = `sortOrder:${direction}`;
      }

      // Default populate to include key relations/media unless caller specified populate
      if (!normalizedQuery.populate) {
        normalizedQuery.populate = {
          coverImage: true,
          gallery: true,
          project_categories: true
        } as any;
      }

      const entity = await strapi
        .service("api::project.project")
        .find(normalizedQuery);
      return this.transformResponse(entity);
    },
    async create(ctx) {
      const body = ctx.request.body as any;
      const data = body?.data ?? body;

      // Normalize incoming category/categories input (ids or names)
      const incomingCategories: Array<
        string | number | { id?: string | number; name?: string }
      > = [];
      if (data && data.category) incomingCategories.push(data.category);
      if (data && Array.isArray(data.categories))
        incomingCategories.push(...data.categories);

      // Remove unsupported direct relation set on the inverse side
      if (data) {
        delete data.category;
        delete data.categories;
      }

      // Create project first
      const response = await super.create(ctx);
      const createdProjectId =
        (response as any)?.data?.id ?? (response as any)?.id;

      if (createdProjectId && incomingCategories.length > 0) {
        const connectedIds: Array<string | number> = [];
        for (const input of incomingCategories) {
          let categoryId: string | number | undefined =
            typeof input === "number" || typeof input === "string"
              ? (input as any)
              : undefined;

          if (!categoryId && input && typeof input === "object") {
            if (
              "id" in input &&
              (typeof (input as any).id === "string" ||
                typeof (input as any).id === "number")
            ) {
              categoryId = (input as any).id as any;
            }
          }

          if (!categoryId) {
            const name: unknown =
              input && typeof input === "object" ? (input as any).name : input;
            if (name && typeof name === "string") {
              // Try to find by name or slug
              const existing = await strapi.entityService.findMany(
                "api::project-category.project-category",
                {
                  filters: {
                    $or: [
                      { name: { $eqi: name } },
                      {
                        slug: { $eqi: name.toLowerCase().replace(/\s+/g, "-") }
                      }
                    ]
                  },
                  limit: 1,
                  fields: ["id"]
                }
              );
              if (existing && existing.length > 0) {
                categoryId = existing[0].id as any;
              } else {
                const created = await strapi.entityService.create(
                  "api::project-category.project-category",
                  {
                    data: {
                      name,
                      slug: name.toLowerCase().replace(/\s+/g, "-"),
                      type: "category"
                    } as any
                  }
                );
                categoryId = created.id as any;
              }
            }
          }

          if (categoryId !== undefined) {
            connectedIds.push(categoryId);
          }
        }

        if (connectedIds.length > 0) {
          await strapi.entityService.update(
            "api::project.project",
            createdProjectId as any,
            {
              data: {
                project_categories: connectedIds as any
              }
            }
          );
        }
      }

      return response;
    }
  })
);