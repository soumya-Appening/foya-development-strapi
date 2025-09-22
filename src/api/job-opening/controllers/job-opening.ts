/**
 * job-opening controller
 */
import { factories } from "@strapi/strapi";
import { Context } from "koa";

// Fields for listing vs. detailed view
const LISTING_FIELDS = [
  "id",
  "position",
  "location",
  "job_type",
  "job_location",
  "working_hour",
  "base_salary",
  "date_posted",
  "valid_through"
];

const DETAILED_FIELDS = [
  "id",
  "position",
  "location",
  "job_type",
  "description",
  "responsibilities",
  "qualification",
  "job_benefits",
  "contacts",
  "job_location",
  "working_hour",
  "base_salary",
  "date_posted",
  "valid_through"
] as any;

export default factories.createCoreController(
  "api::job-opening.job-opening",
  ({ strapi }) => ({
    // 📌 1. Job Listing with filters
    async find(ctx: Context) {
      const query = ctx.query;

      // Build dynamic filters from query params
      const filters: Record<string, any> = {};

      const filterableFields = [
        "position",
        "location",
        "job_type",
        "description",
        "responsibilities",
        "qualification",
        "job_benefits",
        "contacts",
        "job_location",
        "working_hour",
        "base_salary",
        "date_posted",
        "valid_through"
      ];

      for (const field of filterableFields) {
        if (query[field]) {
          filters[field] = { $containsi: query[field] }; // case-insensitive search
        }
      }

      // Salary range filter
      if (query.salary_min || query.salary_max) {
        const salaryFilter: Record<string, any> = {};
        if (query.salary_min) salaryFilter.$gte = query.salary_min;
        if (query.salary_max) salaryFilter.$lte = query.salary_max;
        filters.base_salary = salaryFilter;
      }

      // Date posted range filter
      if (query.date_from || query.date_to) {
        const dateFilter: Record<string, any> = {};
        if (query.date_from)
          dateFilter.$gte = new Date(query.date_from as string);
        if (query.date_to) dateFilter.$lte = new Date(query.date_to as string);
        filters.date_posted = dateFilter;
      }

      // Valid only filter
      if (query.valid_only === "true") {
        filters.valid_through = { $gte: new Date() };
      }

      const validQueryParams: any = {
        ...query,
        filters,
        fields: LISTING_FIELDS,
        publicationState: "live"
      };

      // Pagination
      if (query.start) validQueryParams.start = parseInt(query.start as string);
      if (query.limit) validQueryParams.limit = parseInt(query.limit as string);

      ctx.query = validQueryParams;

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },

    // 📌 2. Job Details by ID
    async findOne(ctx: Context) {
      const { id } = ctx.params;
      if (!id) return ctx.badRequest("Job ID is required");

      const entity = await strapi.entityService.findOne(
        "api::job-opening.job-opening",
        id,
        {
          fields: DETAILED_FIELDS,
          populate: "*",
          publicationState: "live"
        }
      );

      if (!entity) return ctx.notFound("Job opening not found");

      // Expiry check
      const now = new Date();
      const isExpired =
        entity.valid_through && new Date(entity.valid_through) < now;

      const sanitized = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse({
        ...(sanitized as Record<string, any>),
        is_expired: isExpired
      });
    }
  })
);