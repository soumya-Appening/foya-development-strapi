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
        isFeatured,
        category,
        categoryId,
        categorySlug,
        categoryName,
        relatedTo,
        ...restQuery
      } = query as Record<string, any>;

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

      // Explicit isFeatured flag support
      if (isFeatured !== undefined && toBooleanTrue(isFeatured)) {
        mergedFilters.isFeatured = { $eq: true };
      }

      // Related projects: same category as a given project id, excluding it
      if (relatedTo) {
        const baseId = Array.isArray(relatedTo) ? relatedTo[0] : relatedTo;
        const relatedEntity = await strapi.entityService.findOne(
          "api::project.project",
          baseId as any,
          {
            populate: { categories: true }
          }
        );
        const relatedCategoryId = (relatedEntity as any)?.categories?.[0]?.id;
        if (relatedCategoryId) {
          mergedFilters.$and = [
            ...(mergedFilters.$and || []),
            { categories: { id: { $eq: relatedCategoryId } } },
            { id: { $ne: baseId } }
          ];
        } else {
          // If there's no category on the source, return empty set
          mergedFilters.id = { $in: [] };
        }
      }

      // Category filters: by id, slug, or name. Also accept `category` as id/name/slug.
      const resolveCategoryString = async (
        value: string
      ): Promise<string | number | undefined> => {
        const foundBySlug = await strapi.entityService.findMany(
          "api::project-category.project-category",
          {
            filters: { slug: { $eqi: value } },
            limit: 1,
            fields: ["id"]
          }
        );
        if (foundBySlug?.length) return foundBySlug[0].id as any;
        const foundByName = await strapi.entityService.findMany(
          "api::project-category.project-category",
          {
            filters: { name: { $eqi: value } },
            limit: 1,
            fields: ["id"]
          }
        );
        if (foundByName?.length) return foundByName[0].id as any;
        return undefined;
      };

      const categoryParam =
        category ?? categoryId ?? categorySlug ?? categoryName;
      if (categoryParam !== undefined && relatedTo === undefined) {
        let resolvedCategoryId: string | number | undefined;
        if (
          typeof categoryParam === "number" ||
          (typeof categoryParam === "string" && /^\d+$/.test(categoryParam))
        ) {
          resolvedCategoryId =
            typeof categoryParam === "number"
              ? categoryParam
              : Number(categoryParam);
        } else if (typeof categoryParam === "string") {
          resolvedCategoryId = await resolveCategoryString(categoryParam);
        } else if (typeof categoryParam === "object" && categoryParam) {
          if (
            "id" in categoryParam &&
            (typeof (categoryParam as any).id === "string" ||
              typeof (categoryParam as any).id === "number")
          ) {
            resolvedCategoryId = (categoryParam as any).id as any;
          } else if (
            "slug" in categoryParam &&
            typeof (categoryParam as any).slug === "string"
          ) {
            resolvedCategoryId = await resolveCategoryString(
              (categoryParam as any).slug
            );
          } else if (
            "name" in categoryParam &&
            typeof (categoryParam as any).name === "string"
          ) {
            resolvedCategoryId = await resolveCategoryString(
              (categoryParam as any).name
            );
          }
        }

        if (resolvedCategoryId !== undefined) {
          mergedFilters.categories = { id: { $eq: resolvedCategoryId } };
        } else {
          // Force empty result if category not resolvable
          mergedFilters.id = { $in: [] };
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

      // Default populate to include key relations/media unless caller specified populate
      if (!normalizedQuery.populate) {
        normalizedQuery.populate = {
          image: true,
          gallery: true,
          categories: true
        } as any;
      }

      const entity = await strapi
        .service("api::project.project")
        .find(normalizedQuery);
      return this.transformResponse(entity);
    },
    async create(ctx) {
      const { data } = ctx.request.body as any;
      if (data && data.category) {
        const categoryInput = data.category;
        let categoryId: string | number | undefined =
          typeof categoryInput === "number" || typeof categoryInput === "string"
            ? categoryInput
            : undefined;

        if (!categoryId && categoryInput && typeof categoryInput === "object") {
          if (
            "id" in categoryInput &&
            (typeof categoryInput.id === "string" ||
              typeof categoryInput.id === "number")
          ) {
            categoryId = categoryInput.id as string | number;
          }
        }

        if (!categoryId) {
          const name: unknown =
            categoryInput && typeof categoryInput === "object"
              ? (categoryInput as any).name
              : categoryInput;
          if (name && typeof name === "string") {
            const existing = await strapi.entityService.findMany(
              "api::project-category.project-category",
              {
                filters: { name: { $eqi: name } },
                limit: 1,
                fields: ["id"]
              }
            );
            if (existing && existing.length > 0) {
              categoryId = existing[0].id as string | number;
            } else {
              const created = await strapi.entityService.create(
                "api::project-category.project-category",
                {
                  data: {
                    name,
                    slug: name.toLowerCase().replace(/\s+/g, "-"),
                    type: "category"
                  }
                }
              );
              categoryId = created.id as string | number;
            }
          }
        }

        if (categoryId !== undefined) {
          data.category = categoryId;
        }
      }

      const response = await super.create(ctx);
      return response;
    }
  })
);
