/**
 * team-member controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::team-member.team-member",
  ({ strapi }) => ({
    async find(ctx) {
      // Ensure photo is populated
      const incomingPopulate = (ctx.query as any)?.populate;
      let mergedPopulate: any;
      if (!incomingPopulate) {
        mergedPopulate = { photo: true };
      } else if (Array.isArray(incomingPopulate)) {
        mergedPopulate = Array.from(
          new Set([...(incomingPopulate as any[]), "photo"])
        );
      } else if (typeof incomingPopulate === "string") {
        mergedPopulate = [incomingPopulate, "photo"];
      } else if (typeof incomingPopulate === "object") {
        mergedPopulate = { ...(incomingPopulate as any), photo: true };
      } else {
        mergedPopulate = { photo: true };
      }

      // Default sort by sortOrder ascending if not provided
      const incomingSort = (ctx.query as any)?.sort;
      const mergedSort = incomingSort ?? "sortOrder:asc";

      const params = {
        ...(ctx.query as any),
        populate: mergedPopulate,
        sort: mergedSort
      } as any;
      const entity = await strapi
        .service("api::team-member.team-member")
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
        // Flat shape
        if ("photo" in item) {
          return { ...item, photo: absolutizeMedia(item.photo) };
        }
        // Strapi default attributes shape fallback
        if (item.attributes) {
          return {
            ...item,
            attributes: {
              ...item.attributes,
              photo: absolutizeMedia(item.attributes.photo)
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
