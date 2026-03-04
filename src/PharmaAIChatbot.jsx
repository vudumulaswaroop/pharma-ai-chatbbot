import {useEffect, useRef, useState} from "react";
import {EQUIPMENT_CONTEXTS, QUICK_PROMPTS} from "./const/const";
import {TypingDots} from "./TypingDots";

export default function PharmaSupportChat() {
    const [activeEquipment, setActiveEquipment] = useState("reactor");
    const [messages, setMessages] = useState({
        reactor: [],
        centrifuge: [],
        anfd: [],
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const eq = EQUIPMENT_CONTEXTS[activeEquipment];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const userText = text || input.trim();
        if (!userText || loading) return;
        setInput("");

        const newMsg = { role: "user", content: userText };
        const updatedMsgs = [...(messages[activeEquipment] || []), newMsg];

        setMessages((prev) => ({ ...prev, [activeEquipment]: updatedMsgs }));
        setLoading(true);

        try {
            const apiMessages = updatedMsgs.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: eq.systemPrompt,
                    messages: apiMessages,
                }),
            });

            const data = await response.json();
            const assistantText = data.content?.map((b) => b.text || "").join("\n") || "No response.";

            setMessages((prev) => ({
                ...prev,
                [activeEquipment]: [
                    ...updatedMsgs,
                    { role: "assistant", content: assistantText },
                ],
            }));
        } catch (err) {
            setMessages((prev) => ({
                ...prev,
                [activeEquipment]: [
                    ...updatedMsgs,
                    { role: "assistant", content: "⚠️ Connection error. Please try again." },
                ],
            }));
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const currentMessages = messages[activeEquipment] || [];

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0a0e1a",
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            color: "#e2e8f0",
            display: "flex",
            flexDirection: "column",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;600;700&display=swap');
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0e1a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        textarea { resize: none; font-family: inherit; }
        textarea:focus { outline: none; }
      `}</style>

            {/* Header */}
            <div style={{
                borderBottom: "1px solid #1e293b",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(10,14,26,0.95)",
                backdropFilter: "blur(10px)",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${eq.color}22, ${eq.color}44)`,
                        border: `1px solid ${eq.color}66`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                    }}>
                        {eq.icon}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.02em" }}>
                            PHARMA<span style={{ color: eq.color }}>AI</span> SUPPORT
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>
                            GMP-AWARE PROCESS ENGINEERING ASSISTANT
                        </div>
                    </div>
                </div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 10,
                    color: "#10b981",
                    letterSpacing: "0.05em",
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }} />
                    ONLINE
                </div>
            </div>

            {/* Equipment Tabs */}
            <div style={{
                display: "flex",
                padding: "12px 24px 0",
                gap: 4,
                borderBottom: "1px solid #1e293b",
                background: "#0d1220",
            }}>
                {Object.entries(EQUIPMENT_CONTEXTS).map(([key, val]) => (
                    <button
                        key={key}
                        onClick={() => setActiveEquipment(key)}
                        style={{
                            padding: "8px 16px",
                            border: "none",
                            background: activeEquipment === key ? `${val.color}18` : "transparent",
                            borderBottom: activeEquipment === key ? `2px solid ${val.color}` : "2px solid transparent",
                            color: activeEquipment === key ? val.color : "#64748b",
                            cursor: "pointer",
                            fontSize: 12,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <span>{val.icon}</span>
                        {val.label.toUpperCase()}
                        {messages[key].length > 0 && (
                            <span style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                background: val.color,
                                color: "#0a0e1a",
                                fontSize: 9,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                            }}>
                {messages[key].filter(m => m.role === "user").length}
              </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 0,
                maxHeight: "calc(100vh - 280px)",
            }}>
                {currentMessages.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: 40, animation: "fadeSlide 0.5s ease" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>{eq.icon}</div>
                        <div style={{
                            fontSize: 18,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            color: eq.color,
                            marginBottom: 8,
                        }}>
                            {eq.label} Support Active
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
                            Ask anything about {eq.label.toLowerCase()} operations, troubleshooting, GMP compliance, or process optimization.
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 600, margin: "0 auto" }}>
                            {QUICK_PROMPTS[activeEquipment].map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    style={{
                                        padding: "8px 14px",
                                        background: `${eq.color}10`,
                                        border: `1px solid ${eq.color}33`,
                                        borderRadius: 6,
                                        color: "#94a3b8",
                                        cursor: "pointer",
                                        fontSize: 11,
                                        fontFamily: "inherit",
                                        transition: "all 0.2s",
                                        textAlign: "left",
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.background = `${eq.color}20`;
                                        e.target.style.color = eq.color;
                                        e.target.style.borderColor = `${eq.color}66`;
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.background = `${eq.color}10`;
                                        e.target.style.color = "#94a3b8";
                                        e.target.style.borderColor = `${eq.color}33`;
                                    }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {currentMessages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            animation: "fadeSlide 0.3s ease",
                        }}
                    >
                        {msg.role === "assistant" && (
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: `${eq.color}22`,
                                border: `1px solid ${eq.color}44`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                marginRight: 10,
                                flexShrink: 0,
                                marginTop: 2,
                            }}>
                                {eq.icon}
                            </div>
                        )}
                        <div style={{
                            maxWidth: "72%",
                            padding: "12px 16px",
                            borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                            background: msg.role === "user"
                                ? `linear-gradient(135deg, ${eq.color}30, ${eq.color}18)`
                                : "#131929",
                            border: msg.role === "user"
                                ? `1px solid ${eq.color}44`
                                : "1px solid #1e293b",
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: msg.role === "user" ? "#e2e8f0" : "#cbd5e1",
                            whiteSpace: "pre-wrap",
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: "flex", alignItems: "flex-start", animation: "fadeSlide 0.3s ease" }}>
                        <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: `${eq.color}22`,
                            border: `1px solid ${eq.color}44`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            marginRight: 10,
                            flexShrink: 0,
                            marginTop: 2,
                        }}>
                            {eq.icon}
                        </div>
                        <div style={{
                            padding: "4px 16px",
                            background: "#131929",
                            border: "1px solid #1e293b",
                            borderRadius: "12px 12px 12px 2px",
                        }}>
                            <TypingDots />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                borderTop: "1px solid #1e293b",
                padding: "16px 24px",
                background: "#0d1220",
            }}>
                {currentMessages.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                        {QUICK_PROMPTS[activeEquipment].slice(0, 3).map((p) => (
                            <button
                                key={p}
                                onClick={() => sendMessage(p)}
                                disabled={loading}
                                style={{
                                    padding: "4px 10px",
                                    background: "transparent",
                                    border: `1px solid #1e293b`,
                                    borderRadius: 4,
                                    color: "#475569",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontFamily: "inherit",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={e => {
                                    e.target.style.borderColor = `${eq.color}44`;
                                    e.target.style.color = eq.color;
                                }}
                                onMouseLeave={e => {
                                    e.target.style.borderColor = "#1e293b";
                                    e.target.style.color = "#475569";
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                <div style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-end",
                    background: "#131929",
                    border: `1px solid ${input ? eq.color + "44" : "#1e293b"}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    transition: "border-color 0.2s",
                }}>
          <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                  }
              }}
              placeholder={`Ask about ${eq.label.toLowerCase()} operations, troubleshooting, GMP...`}
              rows={1}
              style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#e2e8f0",
                  fontSize: 13,
                  lineHeight: 1.5,
                  maxHeight: 100,
                  overflowY: "auto",
              }}
              onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
          />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        style={{
                            padding: "6px 14px",
                            background: input.trim() && !loading ? eq.color : "#1e293b",
                            border: "none",
                            borderRadius: 6,
                            color: input.trim() && !loading ? "#0a0e1a" : "#334155",
                            cursor: input.trim() && !loading ? "pointer" : "default",
                            fontSize: 11,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        SEND ↑
                    </button>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                    fontSize: 9,
                    color: "#334155",
                    letterSpacing: "0.05em",
                }}>
                    <span>SHIFT+ENTER for new line · ENTER to send</span>
                    <span>POWERED BY CLAUDE · GMP-AWARE</span>
                </div>
            </div>
        </div>
    );
}
