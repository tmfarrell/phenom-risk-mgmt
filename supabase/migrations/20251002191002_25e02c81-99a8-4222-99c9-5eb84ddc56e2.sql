-- Create storage bucket for Origin data uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('origin-uploads', 'origin-uploads', false);

-- Create RLS policies for origin-uploads bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'origin-uploads');

CREATE POLICY "Users can view their own uploaded files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'origin-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploaded files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'origin-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);