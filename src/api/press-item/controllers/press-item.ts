/**
 * press-item controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::press-item.press-item",
  ({ strapi }) => ({
    async find(ctx) {
      // Set default sorting by date in descending order (newest first)
      if (!ctx.query.sort) {
        ctx.query.sort = "date:desc";
      }

      return await super.find(ctx);
    }
  })
);
