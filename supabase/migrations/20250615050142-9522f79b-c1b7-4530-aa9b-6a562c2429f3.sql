
-- Add the default_address column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN default_address JSONB;
