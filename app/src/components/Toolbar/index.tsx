import { ChangeEvent } from "react";
import "./style.scss";

export interface ToolbarProps {
  stroke: string;
  lineWidth: number;
  onElementChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  clearCanvas?: () => void;
}

export const Toolbar = (props: ToolbarProps) => {
  return (
    <div style={{ width: "800px" }} className="canvas-toolbar">
      <input
        id="stroke"
        name="stroke"
        type="color"
        value={props.stroke}
        onChange={props.onElementChange}
      />
      <div className="toolbar-element">
        <label htmlFor="lineWidth">Line Width</label>
        <input
          id="lineWidth"
          name="lineWidth"
          type="number"
          value={props.lineWidth}
          onChange={props.onElementChange}
        />
      </div>
      <button id="clear" onClick={props.clearCanvas}>
        Clear
      </button>
    </div>
  );
};
