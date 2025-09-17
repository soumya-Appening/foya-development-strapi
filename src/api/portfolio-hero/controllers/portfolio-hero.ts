/**
 * portfolio-hero controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::portfolio-hero.portfolio-hero",
  ({ strapi }) => ({
    async find(ctx) {
      // Merge populate to include heroBanners.bannerImage
      const incomingPopulate = (ctx.query as any)?.populate;
      let mergedPopulate: any;
      const nestedPopulate = {
        heroBanners: { populate: { bannerImage: true } }
      } as any;
      if (!incomingPopulate) {
        mergedPopulate = nestedPopulate;
      } else if (Array.isArray(incomingPopulate)) {
        mergedPopulate = Array.from(
          new Set([...(incomingPopulate as any[]), nestedPopulate])
        );
      } else if (typeof incomingPopulate === "string") {
        mergedPopulate = [incomingPopulate, nestedPopulate];
      } else if (typeof incomingPopulate === "object") {
        mergedPopulate = { ...(incomingPopulate as any), ...nestedPopulate };
      } else {
        mergedPopulate = nestedPopulate;
      }

      const params = { ...(ctx.query as any), populate: mergedPopulate } as any;
      const entity = await strapi
        .service("api::portfolio-hero.portfolio-hero")
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

      const mapHeroBanners = (heroBanners: any) => {
        if (!Array.isArray(heroBanners)) return heroBanners;
        return heroBanners.map((hb) => ({
          ...hb,
          bannerImage: absolutizeMedia(hb?.bannerImage)
        }));
      };

      const mapItem = (item: any) => {
        if (!item) return item;
        // Flat shape
        if ("heroBanners" in item) {
          return { ...item, heroBanners: mapHeroBanners(item.heroBanners) };
        }
        // Strapi default attributes shape fallback
        if (item.attributes) {
          return {
            ...item,
            attributes: {
              ...item.attributes,
              heroBanners: mapHeroBanners(item.attributes.heroBanners)
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
