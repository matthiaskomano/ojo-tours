import { z } from "zod";

// Tour validation schema
export const tourSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .max(50, "Duration must be less than 50 characters"),
  price: z.string().min(1, "Price is required"),
  category: z.enum(["Wildlife", "Safari", "Culture", "Relaxation"], {
    message: "Category must be Wildlife, Safari, Culture, or Relaxation",
  }),
  image: z.string().url("Image must be a valid URL"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  rating: z.number().min(1).max(5).default(5.0),
});

export type TourInput = z.infer<typeof tourSchema>;

// Lodge validation schema
export const lodgeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be less than 200 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),
  price: z.string().min(1, "Price is required"),
  image: z.string().url("Image must be a valid URL"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  amenities: z.array(z.string()).default([]),
});

export type LodgeInput = z.infer<typeof lodgeSchema>;

// Journal validation schema
export const journalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be less than 100 characters"),
  author: z
    .string()
    .min(1, "Author is required")
    .max(100, "Author must be less than 100 characters"),
  readTime: z
    .string()
    .min(1, "Read time is required")
    .max(50, "Read time must be less than 50 characters"),
  image: z.string().url("Image must be a valid URL"),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(10000, "Excerpt must be less than 10000 characters"),
  content: z.string().optional(),
  gallery: z
    .array(z.string().url("Gallery image must be a valid URL"))
    .default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
});

export type JournalInput = z.infer<typeof journalSchema>;

// Gallery validation schema
export const gallerySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be less than 100 characters"),
  image: z.string().url("Image must be a valid URL"),
  className: z.enum(
    [
      "md:col-span-1 md:row-span-1",
      "md:col-span-2 md:row-span-2",
      "md:col-span-1 md:row-span-2",
      "md:col-span-2 md:row-span-1",
    ],
    {
      message: "Invalid layout size",
    },
  ),
});

export type GalleryInput = z.infer<typeof gallerySchema>;

// Team validation schema
export const teamSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  role: z
    .string()
    .min(1, "Role is required")
    .max(100, "Role must be less than 100 characters"),
  image: z.string().url("Image must be a valid URL"),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(2000, "Bio must be less than 2000 characters"),
});

export type TeamInput = z.infer<typeof teamSchema>;

// Booking validation schema
export const bookingSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  itemType: z.string().min(1, "Item type is required"),
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .max(100, "Name must be less than 100 characters"),
  customerEmail: z.string().email("Invalid email address"),
  date: z.string().min(1, "Date is required"),
  guests: z.string().min(1, "Guest count is required"),
  totalPrice: z.string().min(1, "Total price is required"),
  status: z.enum(["Pending", "Confirmed", "Declined"]).default("Pending"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
