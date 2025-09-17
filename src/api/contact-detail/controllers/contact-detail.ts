/**
 * contact-detail controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::contact-detail.contact-detail",
  ({ strapi }) => ({
    async find(ctx) {
      // Default sort by sortOrder ascending if not provided
      const q = ctx.query as any;
      if (!q.sort) {
        q.sort = "sortOrder:asc";
      }
      return await (this as any).super.find(ctx);
    }
  })
);
