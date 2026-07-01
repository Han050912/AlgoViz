import { Select, Button, Upload, Tooltip } from "antd";
import {
  CodeOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { templates, getTemplateCode } from "./templates";

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onTemplateSelect: (code: string, templateKey: string) => void;
  activeTemplateKey: string | null;
  onFileUpload: (code: string) => void;
}

const languages = ["python", "javascript", "java", "cpp", "go", "rust"];

const EditorToolbar = ({
  language,
  onLanguageChange,
  activeTemplateKey,
  onTemplateSelect,
  onFileUpload,
}: EditorToolbarProps) => {
  const handleLanguageChange = (lang: string) => {
    onLanguageChange(lang);
    if (activeTemplateKey) {
      const tpl = templates.find((t) => t.key === activeTemplateKey);
      if (tpl) {
        onTemplateSelect(getTemplateCode(tpl, lang), activeTemplateKey);
      }
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-3"
      style={{
        height: 40,
        background: "#111827",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Select
        value={language}
        onChange={handleLanguageChange}
        options={languages.map((l) => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
        style={{ width: 130 }}
        size="small"
        suffixIcon={<CodeOutlined style={{ color: "var(--color-text-tertiary)" }} />}
      />

      <Select
        placeholder={"\u6a21\u677f"}
        value={activeTemplateKey ?? undefined}
        onChange={(key) => {
          const tpl = templates.find((t) => t.key === key);
          if (tpl) {
            onLanguageChange(tpl.defaultLanguage);
            onTemplateSelect(getTemplateCode(tpl, tpl.defaultLanguage), tpl.key);
          }
        }}
        allowClear
        onClear={() => {
          onTemplateSelect("", "");
        }}
        options={templates.map((t) => ({
          value: t.key,
          label: t.label,
        }))}
        style={{ width: 150 }}
        size="small"
        suffixIcon={<FileTextOutlined style={{ color: "var(--color-text-tertiary)" }} />}
      />

      <div className="flex-1" />

      <Upload
        accept=".py,.js,.java,.cpp,.go,.rs,.txt"
        showUploadList={false}
        beforeUpload={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            onFileUpload(e.target?.result as string);
            onTemplateSelect("", "");
          };
          reader.readAsText(file);
          return false;
        }}
      >
        <Tooltip title={"\u4e0a\u4f20\u6587\u4ef6"}>
          <Button
            size="small"
            icon={<UploadOutlined />}
            style={{
              background: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-tertiary)",
            }}
          />
        </Tooltip>
      </Upload>
    </div>
  );
};

export default EditorToolbar;
