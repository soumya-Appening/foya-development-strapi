/**
 * home-hero controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::home-hero.home-hero",
  ({ strapi }) => ({
    async find(ctx) {
      const baseUrl = process.env.BASE_URL || "https://api-foya.appening.xyz";

      // Ensure heroBanners and nested bannerImage are populated
      const incomingPopulate = (ctx.query as any)?.populate;
      let mergedPopulate: any;

      if (!incomingPopulate) {
        mergedPopulate = {
          heroBanners: {
            populate: {
              bannerImage: true
            }
          }
        };
      } else if (Array.isArray(incomingPopulate)) {
        mergedPopulate = Array.from(
          new Set([...(incomingPopulate as any[]), "heroBanners"])
        );
      } else if (typeof incomingPopulate === "string") {
        mergedPopulate = [incomingPopulate, "heroBanners"];
      } else if (typeof incomingPopulate === "object") {
        mergedPopulate = {
          ...(incomingPopulate as any),
          heroBanners: {
            populate: {
              bannerImage: true
            }
          }
        };
      } else {
        mergedPopulate = {
          heroBanners: {
            populate: {
              bannerImage: true
            }
          }
        };
      }

      const params = { ...(ctx.query as any), populate: mergedPopulate } as any;
      const entity = await strapi
        .service("api::home-hero.home-hero")
        .find(params);
      let response = (this as any).transformResponse(entity);

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

        const processHeroBanners = (banners: any) => {
          if (!banners) return banners;
          if (!Array.isArray(banners)) return banners;
          return banners.map((banner: any) => {
            if (!banner) return banner;
            return {
              ...banner,
              bannerImage: banner.bannerImage
                ? absolutizeMedia(banner.bannerImage)
                : banner.bannerImage
            };
          });
        };

        // Flat shape (as used elsewhere in this project)
        if ("heroBanners" in item) {
          return {
            ...item,
            heroBanners: processHeroBanners(item.heroBanners)
          };
        }
        // Strapi default attributes shape fallback
        if (item.attributes) {
          return {
            ...item,
            attributes: {
              ...item.attributes,
              heroBanners: processHeroBanners(item.attributes.heroBanners)
            }
          };
        }
        return item;
      };

      // Handle different response structures from transformResponse
      if (response?.data) {
        if (Array.isArray(response.data)) {
          response = {
            ...response,
            data: response.data.map(mapItem)
          };
        } else if (
          response.data.results &&
          Array.isArray(response.data.results)
        ) {
          response = {
            ...response,
            data: {
              ...response.data,
              results: response.data.results.map(mapItem)
            }
          };
        } else {
          response = {
            ...response,
            data: mapItem(response.data)
          };
        }
      }

      return response;
    }
  })
);