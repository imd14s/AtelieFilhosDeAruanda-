import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    return (
        <div className="gmail-editor-container">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Escreva sua mensagem aqui...'}
            />
        </div>
    );
}
