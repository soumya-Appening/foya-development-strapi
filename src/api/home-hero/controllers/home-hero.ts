/**
 * home-hero controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::home-hero.home-hero",
  ({ strapi }) => ({
    async find(ctx) {
      // Ensure heroBanners are populated
      const incomingPopulate = (ctx.query as any)?.populate;
      let mergedPopulate: any;
      if (!incomingPopulate) {
        mergedPopulate = { heroBanners: true };
      } else if (Array.isArray(incomingPopulate)) {
        mergedPopulate = Array.from(
          new Set([...(incomingPopulate as any[]), "heroBanners"])
        );
      } else if (typeof incomingPopulate === "string") {
        mergedPopulate = [incomingPopulate, "heroBanners"];
      } else if (typeof incomingPopulate === "object") {
        mergedPopulate = { ...(incomingPopulate as any), heroBanners: true };
      } else {
        mergedPopulate = { heroBanners: true };
      }

      const params = { ...(ctx.query as any), populate: mergedPopulate } as any;
      const entity = await strapi
        .service("api::home-hero.home-hero")
        .find(params);
      let response = (this as any).transformResponse(entity);

      const baseUrl =
        (strapi.config.get("server.url") as string | undefined) ||
        `${ctx.request.protocol}://${ctx.request.host}`;

      const absolutizeUrl = (
        url?: string | null
      ): string | null | undefined => {
        if (!url) return url;
        if (/^https?:\/\//i.test(url)) return url;
        return `${baseUrl}${url}`;
      };

      const absolutizeMedia = (media: any) => {
        if (!media) return media;
        if (Array.isArray(media)) return media.map(absolutizeMedia);
        const next = { ...media };
        next.url = absolutizeUrl(media.url);
        if (media.formats && typeof media.formats === "object") {
          next.formats = Object.fromEntries(
            Object.entries(media.formats).map(([k, v]: any) => [
              k,
              { ...v, url: absolutizeUrl(v?.url) }
            ])
          );
        }
        return next;
      };

      const mapItem = (item: any) => {
        if (!item) return item;
        // Flat shape (as used elsewhere in this project)
        if ("heroBanners" in item) {
          return { ...item, heroBanners: absolutizeMedia(item.heroBanners) };
        }
        // Strapi default attributes shape fallback
        if (item.attributes) {
          return {
            ...item,
            attributes: {
              ...item.attributes,
              heroBanners: absolutizeMedia(item.attributes.heroBanners)
            }
          };
        }
        return item;
      };

      if (Array.isArray(response?.data)) {
        response.data = response.data.map(mapItem);
      } else if (response?.data) {
        response.data = mapItem(response.data);
      }

      return response;
    }
  })
);