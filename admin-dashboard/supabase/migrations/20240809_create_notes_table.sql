-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255),
    text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own notes or notes for customers they have access to
CREATE POLICY "Users can view their own notes and notes for their customers"
    ON notes FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = notes.customer_id
            AND (
                c.assigned_to = auth.uid() OR
                c.created_by = auth.uid()
            )
        )
    );

-- Policy to allow users to insert their own notes
CREATE POLICY "Users can insert their own notes"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own notes
CREATE POLICY "Users can update their own notes"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
    ON notes FOR DELETE
    USING (auth.uid() = user_id);
