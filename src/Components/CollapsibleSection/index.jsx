import React, { useState, useRef, useEffect } from "react";
import "./index.css";

export default function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("auto");

  useEffect(() => {
    if (open) {
      const h = '72vh';
      setHeight(h);
    } else {
      setHeight(0);
    }
  }, [open, children]);

  return (
    <div className="col-wrap">
      <button
        className="col-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="col-title">{title}</span>
        <span className={`col-icon ${open ? "open" : ""}`}><i className="dx-icon dx-icon-chevrondown" /></span>
      </button>

      <div
        className="col-content-wrapper"
        style={{ height: open ? height : 0 }}
      >
        <div ref={contentRef} className="col-content">
          {children}
        </div>
      </div>
    </div>
  );
}
