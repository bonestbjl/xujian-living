import { useState } from "react";
import { Upload, X } from "lucide-react";

interface LeadFormProps {
  open: boolean;
  sourcePage: string;
  sourceCase?: string;
  onClose: () => void;
}

const needs = ["收纳不足", "儿童成长", "居家办公", "厨房效率", "宠物共居", "老人同住"];

export function LeadForm({ open, sourcePage, sourceCase, onClose }: LeadFormProps) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

  if (!open) return null;

  const toggleNeed = (need: string) => {
    setSelectedNeeds((current) =>
      current.includes(need) ? current.filter((item) => item !== need) : [...current, need]
    );
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="提交户型与需求">
      <div className="lead-modal">
        <button className="icon-button close" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>
        {done ? (
          <div className="success-state">
            <span className="eyebrow">已收到 Demo 线索</span>
            <h2>我们会基于你的户型和家庭需求，整理初步规划方向。</h2>
            <p>来源：{sourcePage}{sourceCase ? ` · ${sourceCase}` : ""}</p>
            <button className="button dark" onClick={onClose}>完成</button>
          </div>
        ) : (
          <>
            <div className="form-head">
              <span className="eyebrow">上传户型图</span>
              <h2>先看看你的户型，有哪些可能。</h2>
              <p className="muted">第 {step} / 3 步</p>
            </div>
            {step === 1 && (
              <div className="form-step">
                <label className="upload-box">
                  <Upload size={22} />
                  <span>选择户型图（Demo 可不上传真实文件）</span>
                  <input type="file" accept="image/*" />
                </label>
                <input placeholder="房屋面积，例如 118㎡" />
                <input placeholder="小区名称" />
              </div>
            )}
            {step === 2 && (
              <div className="form-step">
                <select defaultValue="">
                  <option value="" disabled>家庭成员</option>
                  <option>三口之家</option>
                  <option>新婚二人</option>
                  <option>二胎家庭</option>
                  <option>三代同堂</option>
                  <option>独居</option>
                </select>
                <div className="pill-grid">
                  {needs.map((need) => (
                    <button
                      type="button"
                      className={selectedNeeds.includes(need) ? "pill selected" : "pill"}
                      onClick={() => toggleNeed(need)}
                      key={need}
                    >
                      {need}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="form-step">
                <input placeholder="姓名" />
                <input placeholder="手机号" />
                <input placeholder="微信号（可选）" />
                <p className="fineprint">Demo 阶段不会真实提交到服务器，未来可替换为 CRM 或企业微信接口。</p>
              </div>
            )}
            <div className="form-actions">
              {step > 1 && <button className="button ghost" onClick={() => setStep(step - 1)}>上一步</button>}
              {step < 3 ? (
                <button className="button dark" onClick={() => setStep(step + 1)}>下一步</button>
              ) : (
                <button className="button dark" onClick={() => setDone(true)}>提交需求</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
