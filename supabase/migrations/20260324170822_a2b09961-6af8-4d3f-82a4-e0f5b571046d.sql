
CREATE TABLE public.spray_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  spray_type TEXT NOT NULL CHECK (spray_type IN ('fertilizer', 'herbicide', 'pesticide')),
  product_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  spray_date TIMESTAMP WITH TIME ZONE NOT NULL,
  next_spray_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spray_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert spray schedules"
  ON public.spray_schedules FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read spray schedules"
  ON public.spray_schedules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update spray schedules"
  ON public.spray_schedules FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete spray schedules"
  ON public.spray_schedules FOR DELETE
  TO public
  USING (true);
