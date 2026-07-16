"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface StringListInputProps {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

export function StringListInput({
  label,
  value,
  onChange,
  placeholder,
}: StringListInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mb-2 mt-1">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
        />
        <Button type="button" onClick={handleAdd}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((item, i) => (
          <Badge key={i} variant="secondary" className="flex items-center gap-1 px-2 py-1">
            {item}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="text-gray-500 hover:text-red-500 ml-1 font-bold text-sm"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
