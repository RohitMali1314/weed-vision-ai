CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  image_preview TEXT,
  result_image_url TEXT,
  detections JSONB NOT NULL DEFAULT '[]'::jsonb,
  fertilizers JSONB DEFAULT '[]'::jsonb,
  detection_count INTEGER NOT NULL DEFAULT 0,
  avg_confidence NUMERIC(5,2) DEFAULT 0
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scan history" ON public.scan_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read scan history by device" ON public.scan_history FOR SELECT USING (true);
CREATE POLICY "Anyone can delete own scan history" ON public.scan_history FOR DELETE USING (true);