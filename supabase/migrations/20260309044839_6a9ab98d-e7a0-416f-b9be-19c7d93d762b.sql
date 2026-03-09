
-- The upload policy may also already exist, so use IF NOT EXISTS pattern via DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload photos' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload photos" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'scalp-photos');
  END IF;
END $$;
