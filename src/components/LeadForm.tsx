import { useState } from "react";
import { Upload, X } from "lucide-react";
import { saveLeadSubmission } from "../data/demoStore";

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
  const [form, setForm] = useState({
    area: "",
    community: "",
    city: "无锡",
    familyMembers: "三口之家",
    name: "",
    phone: "",
    wechat: ""
  });
  const [error, setError] = useState("");

  if (!open) return null;

  const toggleNeed = (need: string) => {
    setSelectedNeeds((current) =>
      current.includes(need) ? current.filter((item) => item !== need) : [...current, need]
    );
  };

  const submitDemoLead = () => {
    const phone = form.phone.replace(/\s/g, "");
    if (!form.name.trim()) return setError("请填写称呼");
    if (!/^1\d{10}$/.test(phone)) return setError("请填写 11 位手机号码");
    if (!form.area.trim()) return setError("请填写房屋面积");
    setError("");
    saveLeadSubmission({
      name: form.name.trim(),
      phone: `${phone.slice(0, 3)}****${phone.slice(-4)}`,
      wechat: form.wechat.trim(),
      city: form.city,
      area: form.area.trim(),
      community: form.community.trim() || "演示小区",
      familyMembers: [form.familyMembers],
      painPoints: selectedNeeds.length ? selectedNeeds : ["空间规划咨询"],
      sourcePage,
      sourceCase
    });
    setDone(true);
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
                <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="房屋面积，例如 118㎡" />
                <input value={form.community} onChange={(event) => setForm({ ...form, community: event.target.value })} placeholder="小区名称（演示可填写示例）" />
                <select value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })}>
                  <option>无锡</option>
                  <option>靖江</option>
                  <option>江阴</option>
                  <option>其他城市</option>
                </select>
              </div>
            )}
            {step === 2 && (
              <div className="form-step">
                <select value={form.familyMembers} onChange={(event) => setForm({ ...form, familyMembers: event.target.value })}>
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
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="姓名" />
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="手机号" inputMode="numeric" maxLength={11} />
                <input value={form.wechat} onChange={(event) => setForm({ ...form, wechat: event.target.value })} placeholder="微信号（可选）" />
                {error && <p className="form-error" role="alert">{error}</p>}
                <p className="fineprint">Bonest 演示案例 · 提交内容仅保存在当前浏览器，不会发送到服务器。</p>
              </div>
            )}
            <div className="form-actions">
              {step > 1 && <button className="button ghost" onClick={() => setStep(step - 1)}>上一步</button>}
              {step < 3 ? (
                <button className="button dark" onClick={() => setStep(step + 1)}>下一步</button>
              ) : (
                <button className="button dark" onClick={submitDemoLead}>提交需求</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
