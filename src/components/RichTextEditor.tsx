'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import { Link } from '@tiptap/extension-link';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useCallback, useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function RichTextEditor({ value, onChange, placeholder, style }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TableKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { referrerpolicy: 'no-referrer' },
      }),
      Placeholder.configure({ placeholder: placeholder || '请输入内容...' }),
    ],
    content: value,
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== value) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [value, editor]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('输入链接地址:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    const url = window.prompt('输入图片地址（需以 http:// 或 https:// 开头）:');
    if (url && url.trim()) {
      const trimmed = url.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        editor?.chain().focus().setImage({ src: trimmed }).run();
      } else {
        alert('图片地址必须以 http:// 或 https:// 开头');
      }
    }
  }, [editor]);

  const handleUploadClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'product-images');
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
        const data = await res.json();
        if (data.url) {
          editor?.chain().focus().setImage({ src: data.url }).run();
        } else {
          alert(data.error || '上传失败');
        }
      } catch {
        alert('上传失败，请检查网络');
      }
      setUploading(false);
      document.body.removeChild(input);
    });

    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div style={style} className="tiptap-wrapper">
      <div className="tiptap-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="标题1"
        >H1</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="标题2"
        >H2</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="标题3"
        >H3</button>
        <span className="tiptap-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="加粗"
        ><b>B</b></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="斜体"
        ><i>I</i></button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="删除线"
        ><s>S</s></button>
        <span className="tiptap-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="无序列表"
        >• 列表</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="有序列表"
        >1. 列表</button>
        <span className="tiptap-divider" />
        <button type="button" onClick={addTable} title="插入表格">⊞ 表格</button>
        <button type="button" onClick={addLink} className={editor.isActive('link') ? 'is-active' : ''} title="插入链接">🔗 链接</button>
        <button type="button" onClick={handleUploadClick} disabled={uploading} title="上传本地图片">
          {uploading ? '⏳ 上传中...' : '📤 上传图片'}
        </button>
        <button type="button" onClick={addImageByUrl} title="输入图片URL链接">🖼 图片链接</button>
        <span className="tiptap-divider" />
        <button type="button" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="清除格式">清除</button>
      </div>

      {editor.isActive('table') && (
        <div className="tiptap-table-toolbar">
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>左侧插入列</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>右侧插入列</button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>删除列</button>
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>上方插入行</button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>下方插入行</button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>删除行</button>
          <button type="button" onClick={() => editor.chain().focus().mergeCells().run()}>合并单元格</button>
          <button type="button" onClick={() => editor.chain().focus().splitCell().run()}>拆分单元格</button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>删除表格</button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
