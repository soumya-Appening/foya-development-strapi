/**
 * availability controller
 */

import { factories } from "@strapi/strapi";

// Helper function to add BASE_URL to image URLs
const transformImageUrls = (image: any) => {
  if (!image) return image;

  const baseUrl = process.env.BASE_URL || "";

  // Transform main image URL
  if (image.url && !image.url.startsWith("http")) {
    image.url = `${baseUrl}${image.url}`;
  }

  // Transform formats (thumbnail, small, medium, large)
  if (image.formats) {
    Object.keys(image.formats).forEach((formatKey) => {
      const format = image.formats[formatKey];
      if (format.url && !format.url.startsWith("http")) {
        format.url = `${baseUrl}${format.url}`;
      }
    });
  }

  return image;
};

export default factories.createCoreController(
  "api::availability.availability",
  ({ strapi }) => ({
    async find(ctx) {
      // Populate the image field
      ctx.query = {
        ...ctx.query,
        populate: {
          image: true
        }
      };

      const { data, meta } = await super.find(ctx);

      // Transform the response to include full URL for images
      const transformedData = data.map((item) => {
        if (item?.image) {
          item.image = transformImageUrls(item.image);
        }
        return item;
      });

      return { data: transformedData, meta };
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      // Populate the image field
      ctx.query = {
        ...ctx.query,
        populate: {
          image: true
        }
      };

      const response = await super.findOne(ctx);

      // Transform the response to include full URL for image
      if (response?.data?.image) {
        response.data.image = transformImageUrls(response.data.image);
      }

      return response;
    }
  })
);