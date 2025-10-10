-- Create RLS policies for mission-videos bucket

-- Allow authenticated users to upload their own videos
CREATE POLICY "Users can upload mission videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mission-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view all mission videos
CREATE POLICY "Users can view mission videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'mission-videos');

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'mission-videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);