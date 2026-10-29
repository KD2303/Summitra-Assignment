import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional().default(''),
  location: z.string().min(2, 'Location is required').max(255),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date is required'
  }),
  total_seats: z.number().int().min(1, 'Total seats must be at least 1'),
  price: z.number().min(0, 'Price must be non-negative').default(0),
  img: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  categories: z.array(
    z.object({
      name: z.string().min(1, 'Category name is required'),
      price: z.number().min(0, 'Category price must be non-negative'),
      seat_limit: z.number().int().positive().nullable().optional()
    })
  ).optional()
});

export const updateEventSchema = createEventSchema.partial();

export const bookingSchema = z.object({
  eventId: z.number().int().positive('Valid event ID is required'),
  categoryId: z.number().int().positive().nullable().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Valid email address is required').max(200),
  mobile: z.string().min(7, 'Mobile number must be at least 7 digits').max(20),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 tickets per booking'),
  lockId: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Valid admin email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
