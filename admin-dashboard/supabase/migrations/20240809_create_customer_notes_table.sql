-- Create customer_notes table
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select notes for customers they have access to
CREATE POLICY "Users can view notes for their customers"
    ON customer_notes FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = customer_notes.customer_id
            AND (
                c.assigned_to = auth.uid() OR
                c.created_by = auth.uid()
            )
        )
    );

-- Policy to allow users to insert their own notes
CREATE POLICY "Users can insert their own customer notes"
    ON customer_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own notes
CREATE POLICY "Users can update their own customer notes"
    ON customer_notes FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to delete their own notes
CREATE POLICY "Users can delete their own customer notes"
    ON customer_notes FOR DELETE
    USING (auth.uid() = user_id);
