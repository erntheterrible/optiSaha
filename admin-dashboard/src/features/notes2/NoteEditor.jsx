import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { 
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem
} from '@mui/material';

// Icons
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TableChartIcon from '@mui/icons-material/TableChart';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteColumnIcon from '@mui/icons-material/Delete';
import DeleteRowIcon from '@mui/icons-material/DeleteOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';



/**
 * Tiptap-based rich text editor
 * @param {string} content - initial html content
 * @param {(html:string)=>void} onChange - fired on every document update (debounced by parent)
 */
const COLORS = [
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Lime', value: '#d9f99d' },
  { label: 'Cyan', value: '#a5f3fc' },
  { label: 'Violet', value: '#ddd6fe' },
  { label: 'Rose', value: '#fecdd3' },
];

const MenuBar = ({ editor }) => {
  const [colorAnchor, setColorAnchor] = useState(null);
  const [highlightAnchor, setHighlightAnchor] = useState(null);
  const [tableAnchor, setTableAnchor] = useState(null);

  const handleColorClick = (color) => {
    editor.chain().focus().setColor(color).run();
    setColorAnchor(null);
  };

  const handleHighlightClick = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setHighlightAnchor(null);
  };

  if (!editor) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        py: 1,
        px: 1.5,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        overflowX: 'auto',
        '& .MuiToggleButtonGroup-root': {
          flexShrink: 0,
        },
        '& .MuiButtonBase-root': {
          minWidth: '40px',
          height: '40px',
        },
      }}
    >
      <ToggleButtonGroup size="medium">
        <ToggleButton
          value="undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <UndoIcon />
        </ToggleButton>
        <ToggleButton
          value="redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <RedoIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="medium">
        <ToggleButton
          value="h1"
          selected={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Typography variant="button" sx={{ fontWeight: 800, fontSize: '1rem' }}>H1</Typography>
        </ToggleButton>
        <ToggleButton
          value="h2"
          selected={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Typography variant="button" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>H2</Typography>
        </ToggleButton>
        <ToggleButton
          value="h3"
          selected={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Typography variant="button" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>H3</Typography>
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="medium">
        <ToggleButton
          value="bold"
          selected={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton
          value="strike"
          selected={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughSIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Color Pickers */}
      <Tooltip title="Text Color">
        <IconButton onClick={(e) => setColorAnchor(e.currentTarget)}>
          <FormatColorTextIcon sx={{ color: editor.getAttributes('textStyle').color || 'inherit' }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={colorAnchor} open={Boolean(colorAnchor)} onClose={() => setColorAnchor(null)}>
        {COLORS.map((color) => (
          <MenuItem key={color.value} onClick={() => handleColorClick(color.value)}>
            <Box sx={{ width: 20, height: 20, bgcolor: color.value, mr: 1, borderRadius: '50%' }} />
            {color.label}
          </MenuItem>
        ))}
        <MenuItem onClick={() => handleColorClick('')}>Default</MenuItem>
      </Menu>

      <Tooltip title="Highlight Color">
        <IconButton onClick={(e) => setHighlightAnchor(e.currentTarget)}>
          <BorderColorIcon sx={{ color: editor.getAttributes('highlight')?.color || 'inherit' }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={highlightAnchor} open={Boolean(highlightAnchor)} onClose={() => setHighlightAnchor(null)}>
        {HIGHLIGHT_COLORS.map((color) => (
          <MenuItem key={color.value} onClick={() => handleHighlightClick(color.value)}>
            <Box sx={{ width: 20, height: 20, bgcolor: color.value, mr: 1 }} />
            {color.label}
          </MenuItem>
        ))}
        <MenuItem onClick={() => editor.chain().focus().unsetHighlight().run()}>None</MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="medium">
        <ToggleButton
          value="bulletList"
          selected={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          selected={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon />
        </ToggleButton>
        <ToggleButton
          value="taskList"
          selected={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <CheckBoxIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      {/* Table Controls */}
      <Tooltip title="Table Options">
        <IconButton onClick={(e) => setTableAnchor(e.currentTarget)} disabled={!editor.can().insertTable()}>
          <TableChartIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={tableAnchor} open={Boolean(tableAnchor)} onClose={() => setTableAnchor(null)}>
        <MenuItem onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setTableAnchor(null);}}><AddBoxIcon sx={{mr:1}}/> Insert Table</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableAnchor(null);}} disabled={!editor.can().addColumnBefore()}>Add Column Before</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableAnchor(null);}} disabled={!editor.can().addColumnAfter()}>Add Column After</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().deleteColumn().run(); setTableAnchor(null);}} disabled={!editor.can().deleteColumn()}><DeleteColumnIcon sx={{mr:1}}/>Delete Column</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().addRowBefore().run(); setTableAnchor(null);}} disabled={!editor.can().addRowBefore()}>Add Row Before</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().addRowAfter().run(); setTableAnchor(null);}} disabled={!editor.can().addRowAfter()}>Add Row After</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().deleteRow().run(); setTableAnchor(null);}} disabled={!editor.can().deleteRow()}><DeleteRowIcon sx={{mr:1}}/>Delete Row</MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().mergeCells().run(); setTableAnchor(null);}} disabled={!editor.can().mergeCells()}>Merge Cells</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().splitCell().run(); setTableAnchor(null);}} disabled={!editor.can().splitCell()}>Split Cell</MenuItem>
        <Divider />
        <MenuItem onClick={() => { editor.chain().focus().deleteTable().run(); setTableAnchor(null);}} disabled={!editor.can().deleteTable()}>Delete Table</MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <Tooltip title="Add Code Block">
          <ToggleButton
            value="codeBlock"
            selected={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <code style={{ fontFamily: 'monospace' }}>{ }</code>
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Add Quote">
          <ToggleButton
            value="blockquote"
            selected={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>“”</Typography>
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>


    </Stack>
  );
};

const NoteEditor = ({ content, onChange, editable = true }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: true,
        orderedList: true,
        codeBlock: true,
        blockquote: true,
        horizontalRule: true
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'mui-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle.configure({
        types: ['textStyle']
      }),
      Color.configure({
        types: ['textStyle']
      })
    ],
    content: content || '',
    editable,
    onUpdate({ editor }) {
      if (onChange) onChange(editor.getHTML());
    },
  });

  // keep external content in sync only on mount or when editor not focused
  useEffect(() => {
    if (editor && !editor.isFocused) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  return (
    <Box 
      sx={{ 
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        '& .ProseMirror': {
          flexGrow: 1,
          height: '100%',
          overflowY: 'auto',
          outline: 'none',
          p: 3,
          px: 4,
          bgcolor: '#fff',
          '& h1': {
            fontSize: '2rem',
            fontWeight: 800,
            mb: 2
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 700,
            mb: 1.5
          },
          '& h3': {
            fontSize: '1.25rem',
            fontWeight: 600,
            mb: 1
          },
          '& p': {
            mb: 1
          },
          '& ul, & ol': {
            pl: 3,
            mb: 1
          },
          '& blockquote': {
            borderLeft: 4,
            borderColor: 'divider',
            pl: 2,
            ml: 0,
            fontStyle: 'italic'
          },
          '& code': {
            bgcolor: 'action.hover',
            px: 1,
            borderRadius: 0.5,
            fontFamily: 'monospace'
          },
          '& pre': {
            bgcolor: 'action.hover',
            p: 2,
            borderRadius: 1,
            mb: 2,
            '& code': {
              bgcolor: 'transparent',
              color: 'primary.main',
              fontFamily: 'Consolas, Monaco, monospace'
            }
          },
          '& hr': {
            border: 'none',
            height: 2,
            bgcolor: 'divider',
            my: 3
          },
          '& mark': {
            backgroundColor: '#fef08a',
            padding: '0 0.2em',
            borderRadius: '0.2em'
          },
          table: {
            borderCollapse: 'collapse',
            margin: '0 0 1em',
            width: '100%',
            'th, td': {
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'left',
            },
            th: {
              backgroundColor: '#f2f2f2',
              fontWeight: 'bold',
            },
          },
          '& ul[data-type="taskList"]': {
            listStyle: 'none',
            padding: 0,
            '& li': {
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              marginBottom: 1,
              '& > label': {
                marginRight: 1,
                userSelect: 'none'
              },
              '& > div': {
                flex: 1
              }
            }
          }
        }
      }}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </Box>
  );
};

export default NoteEditor;
