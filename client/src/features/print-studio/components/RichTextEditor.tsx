import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b border-zinc-200 p-1 mb-1 bg-zinc-50/50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-zinc-200 transition ${editor.isActive('bold') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500'}`}
        title="Bold"
      >
        <Bold size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-zinc-200 transition ${editor.isActive('italic') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500'}`}
        title="Italic"
      >
        <Italic size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-zinc-200 transition ${editor.isActive('underline') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500'}`}
        title="Underline"
      >
        <UnderlineIcon size={14} />
      </button>
      <div className="w-px h-4 bg-zinc-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded hover:bg-zinc-200 transition ${editor.isActive('bulletList') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500'}`}
        title="Bullet List"
      >
        <List size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded hover:bg-zinc-200 transition ${editor.isActive('orderedList') ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500'}`}
        title="Ordered List"
      >
        <ListOrdered size={14} />
      </button>
    </div>
  );
};

export function RichTextEditor({ value, onChange, className = '', placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] text-sm leading-relaxed px-2 pb-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if value changes externally (optional, handle with care to avoid loops)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
       // Only update if content is sufficiently different to avoid cursor jumps on every keystroke
       // For now, strict equality check is safe-ish if pure HTML strings match
       if (editor.getHTML() !== value) {
           editor.commands.setContent(value);
       }
    }
  }, [value, editor]);

  return (
    <div className={`border border-zinc-200 rounded-md bg-white focus-within:ring-1 focus-within:ring-brand-primary/30 text-zinc-900 ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
