import { Select, Tooltip } from "antd";
import { CodeOutlined, FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import StarButton from "@/components/StarButton/StarButton";

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  activeTemplateKey: string | null;
  onTemplateSelect: (code: string, templateKey: string) => void;
  onFileUpload: (code: string) => void;
  projectId?: string;
}

const languages = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const EditorToolbar = ({
  language,
  onLanguageChange,
  onFileUpload,
  projectId,
}: EditorToolbarProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileUpload(e.target?.result as string);
      setUploading(false);
    };
    reader.readAsText(file);
    return false;
  };

  return (
    <div
      className="flex items-center gap-3 px-3"
      style={{
        height: 36,
        background: "var(--color-bg-elevated)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Select
        value={language}
        onChange={onLanguageChange}
        options={languages}
        style={{ width: 120 }}
        size="small"
        suffixIcon={<CodeOutlined style={{ color: "var(--color-text-tertiary)", fontSize: 12 }} />}
      />

      <div className="flex-1" />

      {/* 收藏 */}
      {projectId && <StarButton projectId={projectId} />}

      {/* 上传文件 */}
      <Tooltip title="上传代码文件">
        <label style={{ cursor: "pointer" }}>
          <input
            type="file"
            accept=".py,.js,.java,.cpp,.go,.rs,.txt"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <span
            className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
            style={{
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              background: uploading ? "rgba(212,154,32,0.1)" : "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            <UploadOutlined style={{ fontSize: 12 }} />
            {uploading ? "上传中..." : "上传"}
          </span>
        </label>
      </Tooltip>
    </div>
  );
};

export default EditorToolbar;
